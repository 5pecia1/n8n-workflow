import { NOTION_DATE_PROPERTY_NAME, NOTION_GCAL_ID_PROPERTY_NAME } from "./configure";
import { getTimeZone } from "./time";

export type NotionDate = {
    start: string;
    end: string | null;
}
export type NotionDateProperty = {
    date: NotionDate;
}
export type NotionGCalIdProperty = {
    rich_text: {
        plain_text: string;
    }[];
}

export type NotionNameProperty = {
    title: {
        text: {
            content: string;
        };
    }[];
}

export type NotionPage = {
    id: string;
    last_edited_time: string;
    properties: {
        [key: string]: NotionDateProperty | NotionGCalIdProperty | NotionNameProperty;
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
    const startDateTime = getNotionDateProperty(page).date.start;
    const endDateTime: string | null = !getNotionDateProperty(page).date.end
        ? null
        : getNotionDateProperty(page).date.end as string;

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

export function getNotionDateProperty(page: NotionPage): NotionDateProperty {
    return page.properties[NOTION_DATE_PROPERTY_NAME] as NotionDateProperty;
}

export function getNotionGCalIdProperty(page: NotionPage): NotionGCalIdProperty {
    return page.properties[NOTION_GCAL_ID_PROPERTY_NAME] as NotionGCalIdProperty;
}

export function getNotionNameProperty(page: NotionPage): NotionNameProperty {
    return page.properties.Name as NotionNameProperty;
}