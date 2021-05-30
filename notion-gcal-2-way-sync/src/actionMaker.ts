// ======================= set const =======================
const ONE_DAY_UNIX_TIME = 86400000;
const ADD_TO_NOTION_MARK = ["notion: ", "notion : ", "Notion: ", "Notion : ", "notion:", "notion :", "Notion:", "Notion :"];
const ADDED_TO_NOTION_MARK = "NOTION_URL:";
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
    [NOTION_LAST_EDITED_TIME_PROPERTY_NAME]: string
    [NOTION_GCAL_ID_PROPERTY_NAME]: string;
    [NOTION_DATE_PROPERTY_NAME]: NotionDate;
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
    const pageStart = Date.parse(page[NOTION_DATE_PROPERTY_NAME].start);
    const pageEnd: number | null = !page[NOTION_DATE_PROPERTY_NAME].end
        ? null
        : Date.parse(page[NOTION_DATE_PROPERTY_NAME].end as string);
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
    const lastIndex = firstLine.lastIndexOf("/");
    return firstLine.substring(lastIndex);
}

function makeEventDescription(page: NotionPage): string {
    return `${ADDED_TO_NOTION_MARK} https://notion.so/${page.id}`;
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
function main(n8nItems: any): Result {
    const events: CalenderEvent[] = n8nItems[0].json.calendar;
    const pages: NotionPage[] = n8nItems[1].json.notion;

    const result: Actions = {
        create_events: [],
        create_pages: [],
        delete_events: [],
        delete_pages: [],
        update_events: [],
        update_pages: [],
    };
    const eventPages = pages.filter(p => p[NOTION_DATE_PROPERTY_NAME]);
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

        const gcalIdInPage = page[NOTION_GCAL_ID_PROPERTY_NAME];
        if (gcalIdInPage) {
            const event = followEventMap.get(gcalIdInPage);

            if (event) {
                const { eventStart, eventEnd, isEventOneDayAllDay } = makeEventState(event);
                const pageIdInEvent = makePageId(event);

                followEventMap.delete(gcalIdInPage);

                // check diff
                if (
                    (pageStart != eventStart) // start time
                    || (isPageOneDayAllDAy != isEventOneDayAllDay) // one day 
                    || (!isPageOneDayAllDAy && (pageEnd != eventEnd)) // end time
                ) {
                    // same event
                    // do nothing
                } else {
                    // update
                    const notionLastEditTime = Date.parse(page[NOTION_LAST_EDITED_TIME_PROPERTY_NAME]);
                    const eventLastEditTime = Date.parse(event.updated);

                    if (notionLastEditTime > eventLastEditTime) {
                        // update evnet
                        result.update_events.push({
                            id: page[NOTION_GCAL_ID_PROPERTY_NAME],
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
