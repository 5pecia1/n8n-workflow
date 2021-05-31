// ======================= set const =======================
const ONE_DAY_UNIX_TIME = 86400000;
const ADD_TO_NOTION_MARK = ["notion: ", "notion : ", "Notion: ", "Notion : ", "notion:", "notion :", "Notion:", "Notion :"];
const ADDED_TO_NOTION_MARK = "NOTION_ID: ";
const NOTION_LAST_EDITED_TIME_PROPERTY_NAME = "Last Edited Time";
const NOTION_GCAL_ID_PROPERTY_NAME = "GCal Id";
const NOTION_DATE_PROPERTY_NAME = "FIX-End";

// ======================= set type =======================
type CalenderDate = {
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
}

type NotionDate = {
    start: string;
    end: string | null;
}

type NotionPage = {
    id: string;
    properties: {
        [NOTION_DATE_PROPERTY_NAME]: {
            date: NotionDate;
        };
        [NOTION_GCAL_ID_PROPERTY_NAME]: {
            rich_text: {
                plain_text: string;
            }[];
        };
        [NOTION_LAST_EDITED_TIME_PROPERTY_NAME]: {
            last_edited_time: string;
        };
        Name: {
            title: {
                text: {
                    content: string;
                };
            }[];
        };
    };
};

type CalenderEvent = {
    id: string;
    updated: string;
    summary: string;
    description?: string;
} & CalenderDate;

type CalenderOuputDate = {
    date: {
        start: string;
        end: string;
        is_all_day: boolean;
    };
}

type CreateEvent = {
    page_id: string;
    summary: string;
    description: string;
} & CalenderOuputDate;

type CreatePage = {
    date: NotionDate;
    gcal_id: string;
    event_description: string;
    name: string;
};

type UpdateEvent = {
    id: string;
    summary: string;
} & CalenderOuputDate;

type UpdatePage = {
    id: string;
    name: string;
    date: NotionDate;
};

type DeleteEvent = {
    id: string;
};

type DeletePage = {
    id: string;
};

type PageState = {
    pageStart: number;
    pageEnd: number | null;
    isPageAllDay: boolean;
    isPageOneDayAllDAy: boolean;
}

type EventState = {
    eventStart: number;
    eventEnd: number;
    isEventAllDay: boolean;
    isEventOneDayAllDay: boolean;
}


type Actions = {
    create_events: CreateEvent[];
    create_pages: CreatePage[];
    update_events: UpdateEvent[];
    update_pages: UpdatePage[];
    delete_events: DeleteEvent[];
    // Notion DO NOT SUPPORT DELETE API. ref: https://developers.notion.com
    delete_pages: DeletePage[];
};

type Result = { json: Actions }[];

// ======================= set function =======================
function makePageState(page: NotionPage): PageState {
    const pageStart = Date.parse(page.properties[NOTION_DATE_PROPERTY_NAME].date.start);
    const pageEnd: number | null = !page.properties[NOTION_DATE_PROPERTY_NAME].date.end
        ? null
        : Date.parse(page.properties[NOTION_DATE_PROPERTY_NAME].date.end as string);
    const isPageAllDay = new Date(pageStart).setUTCHours(0, 0, 0, 0).valueOf() === pageStart // UTC midnight
        && (pageEnd === null // one day
            || ((pageEnd - pageStart) % ONE_DAY_UNIX_TIME === 0) //or more day
        );
    const isPageOneDayAllDAy = isPageAllDay && pageEnd === null;

    return {
        pageStart: pageStart,
        pageEnd: pageEnd,
        isPageAllDay: isPageAllDay,
        isPageOneDayAllDAy: isPageOneDayAllDAy,
    };
}

function makeEventState(event: CalenderEvent): EventState {
    const eventStart = Date.parse(event.start.dateTime || event.start.date as string);
    const eventEnd = Date.parse(event.end.dateTime || event.end.date as string);
    const isEventAllDay = new Date(eventStart).setUTCHours(0, 0, 0, 0).valueOf() === eventStart // UTC midnight
        && (eventEnd - eventStart) % ONE_DAY_UNIX_TIME === 0;  // one or more day
    const isEventOneDayAllDay = isEventAllDay && eventEnd - eventStart === ONE_DAY_UNIX_TIME;

    return {
        eventStart: eventStart,
        eventEnd: eventEnd,
        isEventAllDay: isEventAllDay,
        isEventOneDayAllDay: isEventOneDayAllDay,
    };
}

// ADDED_TO_NOTION_MARK https://notion.so/xxxx/<id> => <id>
function makePageId(event: CalenderEvent): string {
    const firstLine = (event.description as string).split("\n")[0];
    // const lastIndex = firstLine.lastIndexOf("\n");
    return firstLine.substring(ADDED_TO_NOTION_MARK.length);
}

function makeEventDescription(page: NotionPage): string {
    return `${ADDED_TO_NOTION_MARK}${page.id}\nhttps://notion.so/${page.id}\n`;
}

function makeNotionPageDate(event: CalenderEvent): NotionDate {
    const { eventStart, eventEnd, isEventOneDayAllDay, isEventAllDay } = makeEventState(event);
    const eventStartString = new Date(eventStart).toISOString();
    const eventEndString = new Date(isEventAllDay? eventEnd - ONE_DAY_UNIX_TIME : eventEnd).toISOString();

    return {
        start: isEventAllDay
            ? eventStartString.substring(0, eventStartString.indexOf("T"))
            : eventStartString,
        end: isEventOneDayAllDay
            ? null
            : isEventAllDay
                ? eventEndString.substring(0, eventEndString.indexOf("T"))
                : eventEndString,
    };
}

function makeCalenderEventDate(page: NotionPage): CalenderOuputDate {
    const { pageStart, pageEnd, isPageAllDay } = makePageState(page);

    return {
        date: {
            start: new Date(pageStart).toISOString(),
            end: isPageAllDay
                ? new Date((pageEnd || pageStart + ONE_DAY_UNIX_TIME) + ONE_DAY_UNIX_TIME).toISOString()
                : new Date(pageEnd || pageStart + ONE_DAY_UNIX_TIME).toISOString(),
            is_all_day: isPageAllDay,
        },
    };
}

// ======================= set main function =======================
export function main(n8nItems: any): Result {
    let events: CalenderEvent[] = n8nItems[0].json.calendar;
    let pages: NotionPage[] = n8nItems[1].json.notion;

    if (!events[0]) {
        events = [];
    }
    if (!pages[0]) {
        pages = [];
    }

    const result: Actions = {
        create_events: [],
        create_pages: [],
        delete_events: [],
        delete_pages: [],
        update_events: [],
        update_pages: [],
    };
    const eventPages = pages.filter(p => p.properties && p.properties[NOTION_DATE_PROPERTY_NAME]);
    const addToNotionList: CalenderEvent[] = [];
    const followEventMap = new Map<string, CalenderEvent>();

    events.forEach(e => {
        for (const mark of ADD_TO_NOTION_MARK) {
            if (e.summary.startsWith(mark)) {
                addToNotionList.push(e);
                e.summary = e.summary.substring(mark.length);
                break;
            }
        }

        if (e.description && e.description.startsWith(ADDED_TO_NOTION_MARK)) {
            followEventMap.set(e.id, e);
        }
    });


    for (const page of eventPages) {
        const { pageStart, pageEnd, isPageOneDayAllDAy } = makePageState(page);

        const gcalInfo = page.properties[NOTION_GCAL_ID_PROPERTY_NAME].rich_text[0];
        if (gcalInfo) {
            const gcalIdInPage = gcalInfo.plain_text;
            const event = followEventMap.get(gcalIdInPage);

            if (event) {
                const { eventStart, eventEnd, isEventOneDayAllDay } = makeEventState(event);
                const pageIdInEvent = makePageId(event);

                followEventMap.delete(gcalIdInPage);

                // check diff
                if (
                    (pageStart == eventStart) // start time
                    && ((isPageOneDayAllDAy == isEventOneDayAllDay) // one day 
                        || (!isPageOneDayAllDAy && (pageEnd == eventEnd))) // end time
                ) {
                    // same event
                    // do nothing
                } else {
                    // update
                    const notionLastEditTime = Date.parse(page.properties[NOTION_LAST_EDITED_TIME_PROPERTY_NAME].last_edited_time);
                    const eventLastEditTime = Date.parse(event.updated);

                    if (notionLastEditTime > eventLastEditTime) {
                        // update evnet
                        result.update_events.push({
                            id: page.properties[NOTION_GCAL_ID_PROPERTY_NAME].rich_text[0].plain_text,
                            summary: page.properties.Name.title[0].text.content,
                            ...makeCalenderEventDate(page),
                        });
                    } else {
                        // update page
                        result.update_pages.push({
                            id: pageIdInEvent,
                            date: makeNotionPageDate(event),
                            name: page.properties.Name.title[0].text.content,
                        });
                    }
                }
            } else {
                // delete event in page
                result.delete_pages.push({
                    id: page.id,
                });
            }
        } else {
            //add to gcal
            result.create_events.push({
                page_id: page.id,
                description: makeEventDescription(page),
                summary: page.properties.Name.title[0].text.content,
                ...makeCalenderEventDate(page),
            });
        }
    }

    for (const [_, event] of Array.from(followEventMap)) {
        // delete in gcal
        result.delete_events.push({
            id: event.id,
        });
    }

    for (const event of Array.from(addToNotionList)) {
        // add to notion
        result.create_pages.push({
            name: event.summary,
            gcal_id: event.id,
            event_description: event.description || "",
            date: makeNotionPageDate(event),
        });
    }

    return [{
        json: result,
    }];
}
