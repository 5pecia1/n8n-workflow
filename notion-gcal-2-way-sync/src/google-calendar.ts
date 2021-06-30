import { ONE_DAY_UNIX_TIME } from "./configure";
import { getTimeZone } from "./time";

export type CalendarDate = {
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
}

export type CalendarEvent = {
    id: string;
    updated: string;
    summary: string;
    description?: string;
} & CalendarDate;

export type CalendarOuputDate = {
    date: {
        start: string;
        end: string;
        is_all_day: boolean;
        timezone: string;
    };
}

export type CreateEvent = {
    page_id: string;
    summary: string;
    description: string;
} & CalendarOuputDate;


export type UpdateEvent = {
    id: string;
    summary: string;
} & CalendarOuputDate;

export type DeleteEvent = {
    id: string;
};

export type EventState = {
    eventStart: number;
    eventEnd: number;
    isEventAllDay: boolean;
    isEventOneDayAllDay: boolean;
}

export function makeEventState(event: CalendarEvent): EventState {
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
