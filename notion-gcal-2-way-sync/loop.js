const KEY = "create_events";
const KEY = "create_pages";
const KEY = "update_pages";
const KEY = "update_events";
const KEY = "delete_pages";
const KEY = "delete_events";

const params = items[0].json[KEY];

const staticData = this.getWorkflowStaticData("node");

let pages;
if (params) {
    pages = params;
} else {
    pages = staticData[KEY];
}

if (pages.length > 0) {
    const result = pages.pop();
    this.getWorkflowStaticData("global")[KEY] = result;
    staticData[KEY] = pages;

    return [{ json: result }];
} else {
    return [];
}