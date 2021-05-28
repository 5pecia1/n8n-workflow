const itmes: any = {};

type NotionPage = {
    id: string;
    last_edited_time: string;
    properties: {
        "GCal-Id": {
            text: string;
        };
        "FIX-End": {
            date: {
                start: string;
                end: string;
            };
        };
    };
};

type CalenderEvent = {
    id: string;
    updated: string;
    summary: string;
    description?: string;
    start: {
        dateTime: string;
    };
    end: {
        dateTime: string;
    };
};

type CreateEvent = {
    date: {
        start: string;
        end: string;
    };
    summary: string;
    description: string;
};
type CreatePage = {
    date: {
        start: string;
        end: string;
    };
    "GCal-Id": string;
    name: string;
};

type UpdateEvent = {
    date: {
        start: string;
        end: string;
    };
    summary: string;
};

type UpdatePage = {
    date: {
        start: string;
        end: string;
    };
    name: string;
};

type DeleteEvent = {
    id: string;
};

type DeletePage = {
    id: string;
};

type Result = {
    create_events: CreateEvent[];
    create_pages: CreatePage[];
    update_events: UpdateEvent[];
    update_pages: UpdatePage[];
    delete_events: DeleteEvent[];
    // Notion DO NOT SUPPORT DELETE API. ref: https://developers.notion.com
    delete_pages: DeletePage[];
};

const ONE_DAY_UNIX_TIME = 86400000;
const ADD_TO_NOTION_MARK = ["notion:", "notion :", "Notion:", "Notion :"];
const ADDED_TO_NOTION_MARK = "NOTION_URL:";

const result: Result = {
    create_events: [],
    create_pages: [],
    delete_events: [],
    delete_pages: [],
    update_events: [],
    update_pages: [],
};

const events: CalenderEvent[] = itmes[0].json.calendar;
const pages: NotionPage[] = itmes[0].json.notion;

const eventPages = pages.filter(p => p["FIX-End"]);
const addToNotionList: CalenderEvent[] = [];
const followEventList: [string, CalenderEvent][] = [];
events.forEach(e => {
    let marked = false;
    for (const mark of ADD_TO_NOTION_MARK) {
        if (e.summary.startsWith(mark)) {
            marked = true;
            break;
        }
    }
    if (marked) {
        addToNotionList.push(e);
    }

    if (e.description, e.description.startsWith(ADDED_TO_NOTION_MARK)) {
        followEventList.push([e.id, e]);
    }
});
const followEventMap = new Map(followEventList);

for (const page of eventPages) {
    const pageStart = Date.parse(page.properties["FIX-End"].date.start);
    const pageEnd: number | null = !page.properties["FIX-End"].date.end ? null : Date.parse(page.properties["FIX-End"].date.end);
    const isPageAllDay = new Date(pageStart).setUTCHours(0, 0, 0, 0).valueOf() === pageStart // UTC midnight
        && (pageEnd === null // one day
            || (pageEnd - pageStart % ONE_DAY_UNIX_TIME === 0) //or more day
        );
    const isPageOneDayAllDAy = isPageAllDay && pageEnd === null;

    const gcalIdInPage = page.properties["GCal Id"];
    if (gcalIdInPage) {
        const event = followEventMap.get(gcalIdInPage.text);

        const eventStart = Date.parse(event.start.dateTime);
        const eventEnd = Date.parse(event.end.dateTime);
        const isEventAllDay = new Date(eventStart).setUTCHours(0, 0, 0, 0).valueOf() === eventStart // UTC midnight
            && eventEnd - eventStart % ONE_DAY_UNIX_TIME === 0;  // one or more day
        const isEventOneDayAllDay = isEventAllDay && eventEnd - eventStart === ONE_DAY_UNIX_TIME;

        if (event) {
            followEventMap.delete(gcalIdInPage.text);
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
                const notionLastEditTime = Date.parse(page.last_edited_time);
                const eventLastEditTime = Date.parse(event.updated);

                if (notionLastEditTime > eventLastEditTime) {
                    // update evnet

                } else {
                    // update page
                }
            }
        } else {
            // deleted event in page
        }
    } else {
        //add to gcal
    }
}

for (const event of followEventMap.values()) {
    // delete in gcal
}

for (const event of addToNotionList.values()) {
    // add to notion
}