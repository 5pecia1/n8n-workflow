/**
 * gcal 
 *   all day => yyyy-mm-dd
 *   with time => iso8601 with timezone(ex. +9)
 * notion
 *   all day => yyyy-mm-dd
 *   with time => iso8601 with timezone(input time zone)
 * js
 *   Support for ISO 8601 formats differs in that date-only strings (e.g. "1970-01-01") are treated as UTC, not local.
 */

// ======================= set const =======================
const ONE_DAY_UNIX_TIME = 86400000;
const ADD_TO_NOTION_MARK = ["notion: ", "notion : ", "Notion: ", "Notion : ", "notion:", "notion :", "Notion:", "Notion :"];
const ADDED_TO_NOTION_MARK = "NOTION_ID: ";
const NOTION_GCAL_ID_PROPERTY_NAME = "GCal Id";
const NOTION_DATE_PROPERTY_NAME = "Start-End Time";
const TIME_ZONE = "Asia/Seoul"
const DEFAULT_RANGE = 30 * 60 * 1000; // 30 min

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
    last_edited_time: string;
    properties: {
        [NOTION_DATE_PROPERTY_NAME]: {
            date: NotionDate;
        };
        [NOTION_GCAL_ID_PROPERTY_NAME]: {
            rich_text: {
                plain_text: string;
            }[];
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
        timezone: string;
    };
}

type NotionOuputDate = {
    is_all_day: boolean;
    timezone: string;
} & NotionDate;

type CreateEvent = {
    page_id: string;
    summary: string;
    description: string;
} & CalenderOuputDate;

type CreatePage = {
    date: NotionOuputDate;
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
    date: NotionOuputDate;
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
function getTImeZoneOffset(): number {
    const dateText = Intl.DateTimeFormat([], { timeZone: TIME_ZONE, timeZoneName: "short" }).format(new Date);
    const timezoneString = dateText.split(" ")[1].slice(3);
    let timezoneOffsetMin = parseInt(timezoneString.split(':')[0]) * 60;

    if (timezoneString.includes(":")) {
        timezoneOffsetMin = timezoneOffsetMin + parseInt(timezoneString.split(':')[1]);
    }

    return timezoneOffsetMin;
}

function getTimeZone(): string {
    const timezoneOffsetMin = getTImeZoneOffset();

    let offsetHrs: string | number = Math.abs(timezoneOffsetMin / 60);
    let offsetMin: string | number = Math.abs(timezoneOffsetMin % 60);
    let timezoneStandard = 'Z';

    if (offsetHrs < 10) {
        offsetHrs = '0' + offsetHrs;
    }
    if (offsetMin < 10) {
        offsetMin = '0' + offsetMin;
    }

    if (timezoneOffsetMin > 0) {
        timezoneStandard = '+' + offsetHrs + ':' + offsetMin;
    } else if (timezoneOffsetMin < 0) {
        timezoneStandard = '-' + offsetHrs + ':' + offsetMin;
    }

    return timezoneStandard;
}

function makeIso8601WithTZ(time: number): string {
    const timezoneOffsetMin = getTImeZoneOffset();

    if (timezoneOffsetMin > 0) {
        time = time + (Math.abs(timezoneOffsetMin)) * 60 * 1000;
    } else if (timezoneOffsetMin < 0) {
        time = time - (Math.abs(timezoneOffsetMin)) * 60 * 1000;
    }

    const dt = new Date(time).toISOString();
    const currentDatetime = dt.substring(0, dt.length - 5); // delete '.000Z'

    return currentDatetime + getTimeZone();
}

function makePageState(page: NotionPage): PageState {
    const startDateTime = page.properties[NOTION_DATE_PROPERTY_NAME].date.start;
    const endDateTime: string | null = !page.properties[NOTION_DATE_PROPERTY_NAME].date.end
        ? null
        : page.properties[NOTION_DATE_PROPERTY_NAME].date.end as string;

    const pageStart = Date.parse(
        startDateTime.includes("T")
            ? startDateTime
            : startDateTime + `T00:00:00${getTimeZone()}`
    );
    const pageEnd: number | null = !endDateTime
        ? null
        : Date.parse(
            endDateTime.includes("T")
                ? endDateTime
                : endDateTime + `T00:00:00${getTimeZone()}`
        );

    const isPageAllDay = !startDateTime.includes("T");

    const isPageOneDayAllDAy = isPageAllDay && pageEnd === null;

    return {
        pageStart: pageStart,
        pageEnd: pageEnd,
        isPageAllDay: isPageAllDay,
        isPageOneDayAllDAy: isPageOneDayAllDAy,
    };
}

function makeEventState(event: CalenderEvent): EventState {
    const startDateTime = event.start.dateTime || event.start.date as string;
    const endDateTime = event.end.dateTime || event.end.date as string;

    const eventStart = Date.parse(
        startDateTime.includes("T")
            ? startDateTime
            : startDateTime + `T00:00:00${getTimeZone()}`
    );
    const eventEnd = Date.parse(
        endDateTime.includes("T")
            ? endDateTime
            : endDateTime + `T00:00:00${getTimeZone()}`
    );
    const isEventAllDay = !!event.start.date;
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
    const descriptoin = (event.description as string);
    let firstLine: string;

    if (descriptoin.includes("\n")) {
        firstLine = descriptoin.substring(0, descriptoin.indexOf("\n"));
    } else {
        firstLine = descriptoin.substring(0, descriptoin.indexOf("<br>"));
    }

    return firstLine.substring(ADDED_TO_NOTION_MARK.length);
}

function makeEventDescription(page: NotionPage): string {
    return `${ADDED_TO_NOTION_MARK}${page.id}\nhttps://notion.so/${page.id}\n`;
}

function makeNotionPageDate(event: CalenderEvent): NotionOuputDate {
    const { eventStart, eventEnd, isEventAllDay, isEventOneDayAllDay } = makeEventState(event);
    const eventStartString = makeIso8601WithTZ(eventStart);
    // const eventEndString = makeIso8601WithTZ(isEventAllDay ? eventEnd - ONE_DAY_UNIX_TIME : eventEnd);
    const eventEndString = isEventOneDayAllDay ? null : makeIso8601WithTZ(isEventAllDay ? (eventEnd - ONE_DAY_UNIX_TIME) : eventEnd);

    return {
        // start: eventStartString,
        // end: eventEndString,
        is_all_day: isEventAllDay,
        timezone: TIME_ZONE,
        start: isEventAllDay
            ? eventStartString.substring(0, eventStartString.indexOf("T"))
            : eventStartString,
        end: eventEndString == null
            ? null
            : isEventAllDay
                ? eventEndString.substring(0, eventEndString.indexOf("T"))
                : eventEndString,
    };
}

function makeCalenderEventDate(page: NotionPage): CalenderOuputDate {
    const { pageStart, pageEnd, isPageAllDay } = makePageState(page);
    const startTime = makeIso8601WithTZ(pageStart);
    // const startTime = new Date(pageStart).toISOString();
    const endTime = isPageAllDay
        ? makeIso8601WithTZ((pageEnd || pageStart) + ONE_DAY_UNIX_TIME)
        : makeIso8601WithTZ(pageEnd || (pageStart + DEFAULT_RANGE));
    // const endTime = isPageAllDay
    //     ? new Date((pageEnd || pageStart) + ONE_DAY_UNIX_TIME).toISOString()
    //     : new Date(pageEnd || pageStart + DEFAULT_RANGE).toISOString(); //add 30 min

    return {
        date: {
            // start: startTime,
            // end: endTime,
            start: isPageAllDay
                ? startTime.substring(0, startTime.indexOf("T"))
                : startTime,
            end: isPageAllDay
                ? endTime.substring(0, endTime.indexOf("T"))
                : endTime,
            is_all_day: isPageAllDay,
            timezone: TIME_ZONE,
        },
    };
}

// ======================= set main function =======================
export function main(n8nItems: any): Result {
    let events: CalenderEvent[] = n8nItems[0].json.calendar;
    let pages: NotionPage[] = n8nItems[1].json.notion;

    if (!Object.keys(events[0]).length) {
        events = [];
    }
    if (!Object.keys(pages[0]).length) {
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
            if (e.summary && e.summary.startsWith(mark)) {
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
                    && ((isPageOneDayAllDAy && isEventOneDayAllDay) // one day 
                        || (!isPageOneDayAllDAy && (pageEnd == eventEnd)) // end time TODO: FIX one day diff between(+1) page and event
                        || (pageEnd == null && !isPageOneDayAllDAy && pageStart + DEFAULT_RANGE == eventEnd)) // not contained page and calendar DEFAULT_RANGE ;
                ) {
                    // same event
                    // do nothing
                } else {
                    // update
                    const notionLastEditTime = Date.parse(page.last_edited_time);
                    const eventLastEditTime = Date.parse(event.updated);

                    if (notionLastEditTime > eventLastEditTime) {
                        const summary = page.properties.Name.title[0] ? page.properties.Name.title[0].text.content : "";
                        // update evnet
                        result.update_events.push({
                            id: page.properties[NOTION_GCAL_ID_PROPERTY_NAME].rich_text[0].plain_text,
                            summary: summary,
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
