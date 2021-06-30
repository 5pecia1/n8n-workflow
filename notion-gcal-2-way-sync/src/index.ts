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

import { ADDED_TO_NOTION_MARK, ADD_TO_NOTION_MARK, DEFAULT_RANGE, NOTION_DATE_PROPERTY_NAME, NOTION_GCAL_ID_PROPERTY_NAME } from "./configure";

import { CreatePage, DeletePage, getNotionGCalIdProperty, getNotionNameProperty, makePageState, NotionPage, UpdatePage } from "./notion"
import { CalendarEvent, CreateEvent, DeleteEvent, makeEventState, UpdateEvent } from "./google-calendar"
import { makeCalendarEventDate, makeEventDescription, makeNotionPageDate, makePageId } from "./utils";

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


// ADDED_TO_NOTION_MARK https://notion.so/xxxx/<id> => <id>

// ======================= set main function =======================
export function main(n8nItems: any): Result {
    let events: CalendarEvent[] = n8nItems[0].json.calendar;
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
    let cnt = 0;
    const eventPages = pages.filter(p => p.properties && p.properties[NOTION_DATE_PROPERTY_NAME]);
    const addToNotionList: CalendarEvent[] = [];
    const followEventMap = new Map<string, CalendarEvent>();

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

        const gcalInfo = getNotionGCalIdProperty(page).rich_text[0];
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
                        const summary = getNotionNameProperty(page).title[0] ? getNotionNameProperty(page).title[0].text.content : "";
                        // update evnet
                        result.update_events.push({
                            id: getNotionGCalIdProperty(page).rich_text[0].plain_text,
                            summary: summary,
                            ...makeCalendarEventDate(page),
                        });
                    } else {
                        // update page
                        result.update_pages.push({
                            id: pageIdInEvent,
                            date_property_name: NOTION_DATE_PROPERTY_NAME,
                            date: makeNotionPageDate(event),
                            name: getNotionNameProperty(page).title[0].text.content,
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
                summary: getNotionNameProperty(page).title[0].text.content,
                ...makeCalendarEventDate(page),
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
            gcal_id_property_name: NOTION_GCAL_ID_PROPERTY_NAME,
            event_description: event.description || "",
            date_property_name: NOTION_DATE_PROPERTY_NAME,
            date: makeNotionPageDate(event),
        });
    }

    return [{
        json: result,
    }];
}
