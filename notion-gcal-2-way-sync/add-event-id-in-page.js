const KEY = "create_events";
const KEY = "update_events";
const KEY = "delete_events";

const data = this.getWorkflowStaticData("global")[KEY];
this.getWorkflowStaticData("global")[KEY] = undefined;

return [{
    json: {
        id: data.page_id,
        gcal_id: items[0].json.id,
    }
}];