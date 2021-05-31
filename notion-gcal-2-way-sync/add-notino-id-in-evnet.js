const KEY = "create_events";
const KEY = "create_pages";
const KEY = "update_pages";
const KEY = "update_events";
const KEY = "delete_pages";
const KEY = "delete_events";

const data = this.getWorkflowStaticData("global")[KEY];
this.getWorkflowStaticData("global")[KEY] = undefined;

return [{
    json: {
        name: data.name,
        gcal_id: data.gcal_id,
        description: 'NOTION_ID: '+ items[0].json.id + '\nhttps://notion.so/' + items[0].json.id.replace(/-/g,"") + '\n' + data.event_description,
    }
}];