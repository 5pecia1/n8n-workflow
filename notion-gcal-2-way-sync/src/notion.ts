import { NOTION_DATE_PROPERTY_NAME, NOTION_GCAL_ID_PROPERTY_NAME } from "./configure";
import { getTimeZone } from "./time";

export type NotionDate = {
    start: string;
    end: string | null;
}

export type NotionPage = {
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

export type NotionOutputDate = {
    is_all_day: boolean;
    timezone: string;
} & NotionDate;

export type CreatePage = {
    date: NotionOutputDate;
    gcal_id: string;
    event_description: string;
    name: string;
};

export type UpdatePage = {
    id: string;
    name: string;
    date: NotionOutputDate;
};

export type DeletePage = {
    id: string;
};

export type PageState = {
    pageStart: number;
    pageEnd: number | null;
    isPageAllDay: boolean;
    isPageOneDayAllDAy: boolean;
}

export function makePageState(page: NotionPage): PageState {
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