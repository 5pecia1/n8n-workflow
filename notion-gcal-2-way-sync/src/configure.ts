declare var $node: any;
const SET_ENVIRONMENTS_NODE_NAME = "Set Environments";

type SetEnvironments = {
    "string": {
        "add to notion mark in gcal": string
        "notion mark in gcal": string
        "gcal id property in notion": string
        "notion date property": string
        "time zone": string
    }
    "number": {
        "default calendar range(min)": number
    }
}

const stringParam: [] = $node[SET_ENVIRONMENTS_NODE_NAME].parameter["values"].string;
const numberParam: [] = $node[SET_ENVIRONMENTS_NODE_NAME].parameter["values"].number;

const env: SetEnvironments = {
    "string": stringParam.reduce((obj, { name, value }) => (Object.assign(obj, { [name]: value })), {}) as any,
    "number": numberParam.reduce((obj, { name, value }) => (Object.assign(obj, { [name]: value })), {}) as any,
};
$node[SET_ENVIRONMENTS_NODE_NAME].parameter["values"];

export const ONE_DAY_UNIX_TIME = 86400000;
export const ADD_TO_NOTION_MARK: string[] = env.string["add to notion mark in gcal"].split(",");// || ["notion: ", "notion : ", "Notion: ", "Notion : ", "notion:", "notion :", "Notion:", "Notion :"];
export const ADDED_TO_NOTION_MARK: string = env.string["notion mark in gcal"];// || "NOTION_ID: ";

export let NOTION_GCAL_ID_PROPERTY_NAME = env.string["gcal id property in notion"];// || "GCal Id";
export let NOTION_DATE_PROPERTY_NAME = env.string["notion date property"];// || "Start-End Time";

export const TIME_ZONE: string = env.string["time zone"] || "Asia/Seoul"
export const DEFAULT_RANGE: number = (env.number["default calendar range(min)"] || 30) * 60 * 1000; // default 30 min
