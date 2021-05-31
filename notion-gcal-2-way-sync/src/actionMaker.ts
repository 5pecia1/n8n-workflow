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
    };
    Name: string;
};

type CalenderEvent = {
    id: string;
    updated: string;
    summary: string;
    description?: string;
} & CalenderDate;

type CreateEvent = {
    summary: string;
    description: string;
} & CalenderDate;

type CreatePage = {
    date: NotionDate;
    gcal_id: string;
    event_description: string;
    name: string;
};

type UpdateEvent = {
    id: string;
    summary: string;
} & CalenderDate;

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
    const { eventStart, eventEnd, isEventOneDayAllDay } = makeEventState(event);

    return {
        start: new Date(eventStart).toISOString(),
        end: isEventOneDayAllDay
            ? null
            : new Date(eventEnd).toISOString(),
    };
}

function makeCalenderEventDate(page: NotionPage): CalenderDate {
    const { pageStart, pageEnd, isPageAllDay } = makePageState(page);

    const result: CalenderDate = {
        start: {},
        end: {},
    };

    if (isPageAllDay) {
        const startDate = new Date(pageStart).toISOString();
        result.start.date = startDate.substring(0, startDate.indexOf("T"));

        const endDate = new Date(pageEnd || pageStart + ONE_DAY_UNIX_TIME).toISOString();
        result.end.date = endDate.substring(0, endDate.indexOf("T"));
    } else {
        result.start.dateTime = new Date(pageStart).toISOString();
        result.end.dateTime = new Date(pageEnd as number).toISOString();
    }

    return result;
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

        const gcalIdInPage = page.properties[NOTION_GCAL_ID_PROPERTY_NAME].rich_text[0].plain_text;
        if (gcalIdInPage) {
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
                            summary: page.Name,
                            ...makeCalenderEventDate(page),
                        });
                    } else {
                        // update page
                        result.update_pages.push({
                            id: pageIdInEvent,
                            date: makeNotionPageDate(event),
                            name: page.Name
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
                description: makeEventDescription(page),
                summary: page.Name,
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
