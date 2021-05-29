"use strict";
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
var itmes = {};
// ======================= set const =======================
var ONE_DAY_UNIX_TIME = 86400000;
var ADD_TO_NOTION_MARK = ["notion:", "notion :", "Notion:", "Notion :"];
var ADDED_TO_NOTION_MARK = "NOTION_URL:";
var NOTION_LAST_EDITED_TIME_PROPERTY_NAME = "Last Edited Time";
var NOTION_GCAL_ID_PROPERTY_NAME = "GCal Id";
var NOTION_DATE_PROPERTY_NAME = "FIX-End";
// ======================= set function =======================
// ADDED_TO_NOTION_MARK https://notion.so/xxxx/<id> => <id>
function makePageId(event) {
    var firstLine = event.description.split("\n")[0];
    var lastIndex = firstLine.lastIndexOf("/");
    return firstLine.substring(lastIndex);
}
function makeEventDescription(page) {
    return ADD_TO_NOTION_MARK + " https://notion.so/" + page.id;
}
function makeNotionPageDate(event) {
    var eventStart = Date.parse(event.start.dateTime);
    var eventEnd = Date.parse(event.end.dateTime);
    var isEventAllDay = new Date(eventStart).setUTCHours(0, 0, 0, 0).valueOf() === eventStart // UTC midnight
        && eventEnd - eventStart % ONE_DAY_UNIX_TIME === 0; // one or more day
    var isEventOneDayAllDay = isEventAllDay && eventEnd - eventStart === ONE_DAY_UNIX_TIME;
    return {
        start: new Date(eventStart).toISOString(),
        end: isEventOneDayAllDay
            ? null
            : new Date(eventEnd).toISOString(),
    };
}
function makeCalenderEventDate(page) {
    var pageStart = Date.parse(page[NOTION_DATE_PROPERTY_NAME].start);
    var pageEnd = !page[NOTION_DATE_PROPERTY_NAME].end
        ? null
        : Date.parse(page[NOTION_DATE_PROPERTY_NAME].end);
    var isPageAllDay = new Date(pageStart).setUTCHours(0, 0, 0, 0).valueOf() === pageStart // UTC midnight
        && (pageEnd === null // one day
            || (pageEnd - pageStart % ONE_DAY_UNIX_TIME === 0) //or more day
        );
    var isPageOneDayAllDAy = isPageAllDay && pageEnd === null;
    return {
        start: {
            dateTime: new Date(pageStart).toISOString(),
        },
        end: {
            dateTime: isPageOneDayAllDAy
                ? new Date(pageStart + ONE_DAY_UNIX_TIME).toISOString()
                : new Date(pageEnd).toISOString(),
        },
    };
}
// ======================= set main function =======================
function main(events, pages) {
    var result = {
        create_events: [],
        create_pages: [],
        delete_events: [],
        delete_pages: [],
        update_events: [],
        update_pages: [],
    };
    var eventPages = pages.filter(function (p) { return p[NOTION_DATE_PROPERTY_NAME]; });
    var addToNotionList = [];
    var followEventMap = new Map();
    events.forEach(function (e) {
        var marked = false;
        for (var _i = 0, ADD_TO_NOTION_MARK_1 = ADD_TO_NOTION_MARK; _i < ADD_TO_NOTION_MARK_1.length; _i++) {
            var mark = ADD_TO_NOTION_MARK_1[_i];
            if (e.summary.startsWith(mark)) {
                marked = true;
                break;
            }
        }
        if (marked) {
            addToNotionList.push(e);
        }
        if (e.description && e.description.startsWith(ADDED_TO_NOTION_MARK)) {
            followEventMap.set(e.id, e);
        }
    });
    for (var _i = 0, eventPages_1 = eventPages; _i < eventPages_1.length; _i++) {
        var page = eventPages_1[_i];
        var pageStart = Date.parse(page[NOTION_DATE_PROPERTY_NAME].start);
        var pageEnd = !page[NOTION_DATE_PROPERTY_NAME].end ? null : Date.parse(page[NOTION_DATE_PROPERTY_NAME].end);
        var isPageAllDay = new Date(pageStart).setUTCHours(0, 0, 0, 0).valueOf() === pageStart // UTC midnight
            && (pageEnd === null // one day
                || (pageEnd - pageStart % ONE_DAY_UNIX_TIME === 0) //or more day
            );
        var isPageOneDayAllDAy = isPageAllDay && pageEnd === null;
        var gcalIdInPage = page[NOTION_GCAL_ID_PROPERTY_NAME];
        if (gcalIdInPage) {
            var event_1 = followEventMap.get(gcalIdInPage);
            if (event_1) {
                var eventStart = Date.parse(event_1.start.dateTime);
                var eventEnd = Date.parse(event_1.end.dateTime);
                var isEventAllDay = new Date(eventStart).setUTCHours(0, 0, 0, 0).valueOf() === eventStart // UTC midnight
                    && eventEnd - eventStart % ONE_DAY_UNIX_TIME === 0; // one or more day
                var isEventOneDayAllDay = isEventAllDay && eventEnd - eventStart === ONE_DAY_UNIX_TIME;
                var pageIdInEvent = makePageId(event_1);
                followEventMap.delete(gcalIdInPage);
                // check diff
                if ((pageStart != eventStart) // start time
                    || (isPageOneDayAllDAy != isEventOneDayAllDay) // one day 
                    || (!isPageOneDayAllDAy && (pageEnd != eventEnd)) // end time
                ) {
                    // same event
                    // do nothing
                }
                else {
                    // update
                    var notionLastEditTime = Date.parse(page[NOTION_LAST_EDITED_TIME_PROPERTY_NAME]);
                    var eventLastEditTime = Date.parse(event_1.updated);
                    if (notionLastEditTime > eventLastEditTime) {
                        // update evnet
                        result.update_events.push(__assign({ id: page[NOTION_GCAL_ID_PROPERTY_NAME], summary: page.Name }, makeCalenderEventDate(page)));
                    }
                    else {
                        // update page
                        result.update_pages.push({
                            id: pageIdInEvent,
                            date: makeNotionPageDate(event_1),
                            name: page.Name
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
            result.create_events.push(__assign({ description: makeEventDescription(page), summary: page.Name }, makeCalenderEventDate(page)));
        }
    }
    for (var _a = 0, _b = Array.from(followEventMap); _a < _b.length; _a++) {
        var _c = _b[_a], _ = _c[0], event_2 = _c[1];
        // delete in gcal
        result.delete_events.push({
            id: event_2.id,
        });
    }
    for (var _d = 0, _e = Array.from(followEventMap); _d < _e.length; _d++) {
        var _f = _e[_d], _ = _f[0], event_3 = _f[1];
        // add to notion
        result.create_pages.push({
            name: event_3.summary,
            gcal_id: event_3.id,
            date: makeNotionPageDate(event_3),
        });
    }
    return result;
}
var events = itmes[0].json.calendar;
var pages = itmes[0].json.notion;
var result = main(events, pages);
// return result;
