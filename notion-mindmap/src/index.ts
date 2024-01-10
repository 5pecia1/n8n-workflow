import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

function convertUrlToUuid(url: string): string {
    const uuidRegex = /([a-zA-Z0-9]{32})\b/;

    const match = url.match(uuidRegex);
    if (!match) {
        throw new Error("UUID not found in the URL");
    }

    const uuid = match[0];

    return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
}

export async function main(n8nItem:{
    json: {
        // https://www.notion.so/xxxx/id
        notion: string,
        // Bearer secret_...
        notionKey: string
    }
}) {
    const notionURl = n8nItem.json.notion;
    const key = n8nItem.json.notionKey.split(" ")[1];
    console.log(notionURl, key);

    const uuidTarget = convertUrlToUuid(notionURl);
    console.log(uuidTarget);

    const notion = new Client({
        auth: key,
    });
    const n2m = new NotionToMarkdown({ notionClient: notion });
    const mdblocks = await n2m.pageToMarkdown(uuidTarget);
    const mdString = n2m.toMarkdownString(mdblocks);
    return {
        json: {
            markdown: mdString
        }
    };
}