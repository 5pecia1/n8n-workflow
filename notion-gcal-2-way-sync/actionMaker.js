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
// ======================= set const =======================
var ONE_DAY_UNIX_TIME = 86400000;
var ADD_TO_NOTION_MARK = ["notion: ", "notion : ", "Notion: ", "Notion : ", "notion:", "notion :", "Notion:", "Notion :"];
var ADDED_TO_NOTION_MARK = "NOTION_URL:";
var NOTION_LAST_EDITED_TIME_PROPERTY_NAME = "Last Edited Time";
var NOTION_GCAL_ID_PROPERTY_NAME = "GCal Id";
var NOTION_DATE_PROPERTY_NAME = "FIX-End";
// ======================= set function =======================
function makePageState(page) {
    var pageStart = Date.parse(page[NOTION_DATE_PROPERTY_NAME].start);
    var pageEnd = !page[NOTION_DATE_PROPERTY_NAME].end
        ? null
        : Date.parse(page[NOTION_DATE_PROPERTY_NAME].end);
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
    var lastIndex = firstLine.lastIndexOf("/");
    return firstLine.substring(lastIndex);
}
function makeEventDescription(page) {
    return ADDED_TO_NOTION_MARK + " https://notion.so/" + page.id;
}
function makeNotionPageDate(event) {
    var _a = makeEventState(event), eventStart = _a.eventStart, eventEnd = _a.eventEnd, isEventOneDayAllDay = _a.isEventOneDayAllDay;
    return {
        start: new Date(eventStart).toISOString(),
        end: isEventOneDayAllDay
            ? null
            : new Date(eventEnd).toISOString(),
    };
}
function makeCalenderEventDate(page) {
    var _a = makePageState(page), pageStart = _a.pageStart, pageEnd = _a.pageEnd, isPageAllDay = _a.isPageAllDay;
    var result = {
        start: {},
        end: {},
    };
    if (isPageAllDay) {
        var startDate = new Date(pageStart).toISOString();
        result.start.date = startDate.substring(0, startDate.indexOf("T"));
        var endDate = new Date(pageEnd || pageStart + ONE_DAY_UNIX_TIME).toISOString();
        result.end.date = endDate.substring(0, endDate.indexOf("T"));
    }
    else {
        result.start.dateTime = new Date(pageStart).toISOString();
        result.end.dateTime = new Date(pageEnd).toISOString();
    }
    return result;
}
// ======================= set main function =======================
function main(n8nItems) {
    var events = n8nItems[0].json.calendar;
    var pages = n8nItems[1].json.notion;
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
        var gcalIdInPage = page[NOTION_GCAL_ID_PROPERTY_NAME];
        if (gcalIdInPage) {
            var event_1 = followEventMap.get(gcalIdInPage);
            if (event_1) {
                var _b = makeEventState(event_1), eventStart = _b.eventStart, eventEnd = _b.eventEnd, isEventOneDayAllDay = _b.isEventOneDayAllDay;
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
return main(items)
