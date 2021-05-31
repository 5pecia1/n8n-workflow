"use strict";
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
// ======================= set const =======================
var ONE_DAY_UNIX_TIME = 86400000;
var ADD_TO_NOTION_MARK = ["notion: ", "notion : ", "Notion: ", "Notion : ", "notion:", "notion :", "Notion:", "Notion :"];
var ADDED_TO_NOTION_MARK = "NOTION_ID: ";
var NOTION_LAST_EDITED_TIME_PROPERTY_NAME = "Last Edited Time";
var NOTION_GCAL_ID_PROPERTY_NAME = "GCal Id";
var NOTION_DATE_PROPERTY_NAME = "FIX-End";
var TIME_ZONE = "Asia/Seoul";
// ======================= set function =======================
function makeIso8601WithTZ(time) {
    var dateText = Intl.DateTimeFormat([], { timeZone: TIME_ZONE, timeZoneName: "short" }).format(new Date);
    var timezoneString = dateText.split(" ")[1].slice(3);
    var timezone_offset_min = parseInt(timezoneString.split(':')[0]) * 60;
    if (timezoneString.includes(":")) {
        timezone_offset_min = timezone_offset_min + parseInt(timezoneString.split(':')[1]);
    }
    var offset_hrs = Math.abs(timezone_offset_min / 60);
    var offset_min = Math.abs(timezone_offset_min % 60);
    var timezone_standard = 'Z';
    if (offset_hrs < 10) {
        offset_hrs = '0' + offset_hrs;
    }
    if (offset_min < 10) {
        offset_min = '0' + offset_min;
    }
    if (timezone_offset_min > 0) {
        timezone_standard = '+' + offset_hrs + ':' + offset_min;
        time = time + (Math.abs(timezone_offset_min)) * 60 * 1000;
    }
    else if (timezone_offset_min < 0) {
        timezone_standard = '-' + offset_hrs + ':' + offset_min;
        time = time - (Math.abs(timezone_offset_min)) * 60 * 1000;
    }
    var dt = new Date(time).toISOString();
    var current_datetime = dt.substring(0, dt.length - 1); // delete 'Z'
    return current_datetime + timezone_standard;
}
function makePageState(page) {
    var pageStart = Date.parse(page.properties[NOTION_DATE_PROPERTY_NAME].date.start);
    var pageEnd = !page.properties[NOTION_DATE_PROPERTY_NAME].date.end
        ? null
        : Date.parse(page.properties[NOTION_DATE_PROPERTY_NAME].date.end);
    var isPageAllDay = new Date(pageStart).setUTCHours(0, 0, 0, 0).valueOf() === pageStart // UTC midnight
        && (pageEnd === null // one day
            || ((pageEnd - pageStart) % ONE_DAY_UNIX_TIME === 0) //or more day
        );
    var isPageOneDayAllDAy = isPageAllDay && pageEnd === null;
    return {
        pageStart: pageStart,
        pageEnd: pageEnd,
        isPageAllDay: isPageAllDay,
        isPageOneDayAllDAy: isPageOneDayAllDAy,
    };
}
function makeEventState(event) {
    var eventStart = Date.parse(event.start.dateTime || event.start.date);
    var eventEnd = Date.parse(event.end.dateTime || event.end.date);
    var isEventAllDay = new Date(eventStart).setUTCHours(0, 0, 0, 0).valueOf() === eventStart // UTC midnight
        && (eventEnd - eventStart) % ONE_DAY_UNIX_TIME === 0; // one or more day
    var isEventOneDayAllDay = isEventAllDay && eventEnd - eventStart === ONE_DAY_UNIX_TIME;
    return {
        eventStart: eventStart,
        eventEnd: eventEnd,
        isEventAllDay: isEventAllDay,
        isEventOneDayAllDay: isEventOneDayAllDay,
    };
}
// ADDED_TO_NOTION_MARK https://notion.so/xxxx/<id> => <id>
function makePageId(event) {
    var firstLine = event.description.split("\n")[0];
    // const lastIndex = firstLine.lastIndexOf("\n");
    return firstLine.substring(ADDED_TO_NOTION_MARK.length);
}
function makeEventDescription(page) {
    return "" + ADDED_TO_NOTION_MARK + page.id + "\nhttps://notion.so/" + page.id + "\n";
}
function makeNotionPageDate(event) {
    var _a = makeEventState(event), eventStart = _a.eventStart, eventEnd = _a.eventEnd, isEventOneDayAllDay = _a.isEventOneDayAllDay, isEventAllDay = _a.isEventAllDay;
    var eventStartString = new Date(eventStart).toISOString();
    var eventEndString = new Date(isEventAllDay ? eventEnd - ONE_DAY_UNIX_TIME : eventEnd).toISOString();
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
function makeCalenderEventDate(page) {
    var _a = makePageState(page), pageStart = _a.pageStart, pageEnd = _a.pageEnd, isPageAllDay = _a.isPageAllDay;
    var startTime = new Date(pageStart).toISOString();
    var endTime = isPageAllDay
        ? new Date((pageEnd || pageStart) + ONE_DAY_UNIX_TIME).toISOString()
        : new Date(pageEnd || pageStart + ONE_DAY_UNIX_TIME).toISOString();
    return {
        date: {
            start: startTime,
            end: isPageAllDay
                ? new Date((pageEnd || pageStart) + ONE_DAY_UNIX_TIME).toISOString()
                : new Date(pageEnd || pageStart + ONE_DAY_UNIX_TIME).toISOString(),
            is_all_day: isPageAllDay,
            timezone: TIME_ZONE,
        },
    };
}
// ======================= set main function =======================
function main(n8nItems) {
    var events = n8nItems[0].json.calendar;
    var pages = n8nItems[1].json.notion;
    if (!events[0]) {
        events = [];
    }
    if (!pages[0]) {
        pages = [];
    }
    var result = {
        create_events: [],
        create_pages: [],
        delete_events: [],
        delete_pages: [],
        update_events: [],
        update_pages: [],
    };
    var eventPages = pages.filter(function (p) { return p.properties && p.properties[NOTION_DATE_PROPERTY_NAME]; });
    var addToNotionList = [];
    var followEventMap = new Map();
    events.forEach(function (e) {
        for (var _i = 0, ADD_TO_NOTION_MARK_1 = ADD_TO_NOTION_MARK; _i < ADD_TO_NOTION_MARK_1.length; _i++) {
            var mark = ADD_TO_NOTION_MARK_1[_i];
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
    for (var _i = 0, eventPages_1 = eventPages; _i < eventPages_1.length; _i++) {
        var page = eventPages_1[_i];
        var _a = makePageState(page), pageStart = _a.pageStart, pageEnd = _a.pageEnd, isPageOneDayAllDAy = _a.isPageOneDayAllDAy;
        var gcalInfo = page.properties[NOTION_GCAL_ID_PROPERTY_NAME].rich_text[0];
        if (gcalInfo) {
            var gcalIdInPage = gcalInfo.plain_text;
            var event_1 = followEventMap.get(gcalIdInPage);
            if (event_1) {
                var _b = makeEventState(event_1), eventStart = _b.eventStart, eventEnd = _b.eventEnd, isEventOneDayAllDay = _b.isEventOneDayAllDay;
                var pageIdInEvent = makePageId(event_1);
                followEventMap.delete(gcalIdInPage);
                // check diff
                if ((pageStart == eventStart) // start time
                    && ((isPageOneDayAllDAy == isEventOneDayAllDay) // one day 
                        || (!isPageOneDayAllDAy && (pageEnd == eventEnd))) // end time
                ) {
                    // same event
                    // do nothing
                }
                else {
                    // update
                    var notionLastEditTime = Date.parse(page.properties[NOTION_LAST_EDITED_TIME_PROPERTY_NAME].last_edited_time);
                    var eventLastEditTime = Date.parse(event_1.updated);
                    if (notionLastEditTime > eventLastEditTime) {
                        // update evnet
                        result.update_events.push(__assign({ id: page.properties[NOTION_GCAL_ID_PROPERTY_NAME].rich_text[0].plain_text, summary: page.properties.Name.title[0].text.content }, makeCalenderEventDate(page)));
                    }
                    else {
                        // update page
                        result.update_pages.push({
                            id: pageIdInEvent,
                            date: makeNotionPageDate(event_1),
                            name: page.properties.Name.title[0].text.content,
                        });
                    }
                }
            }
            else {
                // delete event in page
                result.delete_pages.push({
                    id: page.id,
                });
            }
        }
        else {
            //add to gcal
            result.create_events.push(__assign({ page_id: page.id, description: makeEventDescription(page), summary: page.properties.Name.title[0].text.content }, makeCalenderEventDate(page)));
        }
    }
    for (var _c = 0, _d = Array.from(followEventMap); _c < _d.length; _c++) {
        var _e = _d[_c], _ = _e[0], event_2 = _e[1];
        // delete in gcal
        result.delete_events.push({
            id: event_2.id,
        });
    }
    for (var _f = 0, _g = Array.from(addToNotionList); _f < _g.length; _f++) {
        var event_3 = _g[_f];
        // add to notion
        result.create_pages.push({
            name: event_3.summary,
            gcal_id: event_3.id,
            event_description: event_3.description || "",
            date: makeNotionPageDate(event_3),
        });
    }
    return [{
            json: result,
        }];
}
exports.main = main;
