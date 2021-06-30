import { ADDED_TO_NOTION_MARK, DEFAULT_RANGE, ONE_DAY_UNIX_TIME, TIME_ZONE } from "./configure";
import { CalendarEvent, CalendarOuputDate, makeEventState } from "./google-calendar";
import { makePageState, NotionOutputDate, NotionPage } from "./notion";
import { makeIso8601WithTZ } from "./time";

export function makePageId(event: CalendarEvent): string {
    const descriptoin = (event.description as string);
    let firstLine: string;

    if (descriptoin.includes("\n")) {
        firstLine = descriptoin.substring(0, descriptoin.indexOf("\n"));
    } else {
        firstLine = descriptoin.substring(0, descriptoin.indexOf("<br>"));
    }

    return firstLine.substring(ADDED_TO_NOTION_MARK.length);
}

export function makeEventDescription(page: NotionPage): string {
    return `${ADDED_TO_NOTION_MARK}${page.id}\nhttps://notion.so/${page.id.replace(/-/g, '')}\n`;
}

export function makeNotionPageDate(event: CalendarEvent): NotionOutputDate {
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

export function makeCalendarEventDate(page: NotionPage): CalendarOuputDate {
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