import { Client } from "@notionhq/client";
import {
  GetBlockResponse,
  GetDatabaseResponse,
  GetPageResponse,
  ListBlockChildrenResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import axios from "axios";
import ParserRules from "../parser/ParserRules";
import Settings from "../parser/Settings";
import { IsTypeHeading } from "./blocks/BlockHeadings";

class NotionAPIWrapper {
  private notion: Client;
  page?: GetPageResponse;

  constructor(key: string, useMore?: boolean) {
    this.notion = new Client({ auth: key });
  }

  async getPage(id: string): Promise<GetPageResponse | null> {
    console.log("getPage", id);
    try {
      const page = await this.notion.pages.retrieve({ page_id: id });
      return page;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getBlocks(
    id: string,
    all?: boolean
  ): Promise<ListBlockChildrenResponse> {
    console.log("getBlocks", id, all);
    const response = await this.notion.blocks.children.list({
      block_id: id,
      page_size: 21,
    });

    if (all && response.has_more && response.next_cursor) {
      while (true) {
        /* @ts-ignore */
        const { results, next_cursor } = await this.notion.blocks.children.list(
          {
            block_id: id,
            start_cursor: response.next_cursor!,
          }
        );
        response.results.push(...results);
        if (next_cursor) {
          response.next_cursor = next_cursor;
        } else {
          break;
        }
      }
    }
    return response;
  }

  async getBlock(id: string): Promise<GetBlockResponse> {
    console.log("getBlock", id);
    const response = await this.notion.blocks.retrieve({
      block_id: id,
    });
    return response;
  }

  async getDatabase(id: string): Promise<GetDatabaseResponse> {
    console.log("getDatabase", id);
    const response = await this.notion.databases.retrieve({ database_id: id });
    return response;
  }

  async queryDatabase(
    id: string,
    all?: boolean
  ): Promise<QueryDatabaseResponse> {
    console.log("queryDatabase", id, all);
    // TODO: Add support for pagination when patreon
    const response = await this.notion.databases.query({
      database_id: id,
      page_size: all ? 100 : 21,
    });

    if (all && response.has_more && response.next_cursor) {
      while (true) {
        /* @ts-ignore */
        const { results, next_cursor } = await this.notion.databases.query({
          database_id: id,
          page_size: all ? 100 : 21,
          start_cursor: response.next_cursor!,
        });
        response.results.push(...results);
        if (next_cursor) {
          response.next_cursor = next_cursor;
        } else {
          break;
        }
      }
    }
    return response;
  }

  async search(query: string, all?: boolean) {
    console.debug(`search: ${query}`);
    const response = await this.notion.search({
      page_size: all ? 100 : 21,
      query,
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
    });

    if (all && response.has_more && response.next_cursor) {
      while (true) {
        /* @ts-ignore */
        const { results, next_cursor } = await this.notion.search({
          page_size: all ? 100 : 21,
          query,
          start_cursor: response.next_cursor!,
          sort: {
            direction: "descending",
            timestamp: "last_edited_time",
          },
        });
        response.results.push(...results);
        if (next_cursor) {
          response.next_cursor = next_cursor;
        } else {
          break;
        }
      }
    }

    return response;
  }

  static GetClientID(): string {
    return process.env.NOTION_CLIENT_ID!;
  }

  async getTopLevelTags(pageId: string, rules: ParserRules) {
    const useHeadings = rules.TAGS === "heading";
    const response = await this.getBlocks(pageId, rules.UNLIMITED);
    const globalTags = [];
    if (useHeadings) {
      const headings = response.results.filter((block) => IsTypeHeading(block));
      for (const heading of headings) {
        /* @ts-ignore */
        const t = heading.type;
        /* @ts-ignore */
        const text = heading[t].text[0];
        globalTags.push(text.plain_text);
      }
    } else {
      const paragraphs = response.results.filter(
        /* @ts-ignore */
        (block) => block.type === "paragraph"
      );
      for (const p of paragraphs) {
        /* @ts-ignore */
        const pp = p.paragraph;
        if (!pp) continue;
        const tt = pp.text;
        /* @ts-ignore */
        if (!tt || tt.length < 1) continue;
        const annotations = tt[0].annotations;
        if (annotations.strikethrough) {
          globalTags.push(tt[0].text.content.replace(/\\s+/g, ""));
        }
      }
    }
    return globalTags.map((gt) => gt.trim().replace(/\s/g, "-"));
  }

  async getPageTitle(
    page: GetPageResponse,
    settings: Settings
  ): Promise<string> {
    console.debug(`getPageTitle: ${JSON.stringify(page.id, null, 4)}`);
    if (!page) {
      throw new Error("missing page");
    }

    let title = "Untitled: " + new Date();
    let icon = "";

    /* @ts-ignore */
    if (page.icon && settings.pageEmoji !== "disable_emoji") {
      /* @ts-ignore */
      let pageIcon = page.icon;
      if (pageIcon.type === "external") {
        icon = `<img src="${pageIcon.external.url}" width="32" /> `;
      } else if (pageIcon.type === "emoji") {
        icon = pageIcon.emoji + " ";
      } else if (pageIcon.type === "file") {
        const fileRequest = await axios.get(pageIcon.file.url, {
          responseType: "arraybuffer",
        });
        const file = fileRequest.data;
        let uri = `data:${
          fileRequest.headers["content-type"]
        };base64,${file.toString("base64")}`;
        icon = `<img src="${uri}" width="32" /> `;
      }
    }

    /* @ts-ignore */
    const properties = page.properties;
    if (properties.title && properties.title.title.length > 0) {
      title = properties.title.title[0].plain_text;
    } else if (
      properties.Name &&
      properties.Name.title &&
      properties.Name.title.length > 0
    ) {
      title = properties.Name.title[0].plain_text;
    }

    // the order here matters due to icon not being set and last not being default
    return settings.pageEmoji !== "last_emoji"
      ? `${icon}${title}`
      : `${title}${icon}`;
  }

  getDatabaseTitle(database: GetDatabaseResponse, settings: Settings): string {
    let icon = "";
    let title = "";
    try {
      /* @ts-ignore */
      title = database.title
        /* @ts-ignore */
        .map((t) => t.plain_text)
        .join("");
      /* @ts-ignore */
      const dbIcon = database.icon;
      if (dbIcon.type === "emoji" && settings.pageEmoji !== "disable_emoji") {
        /* @ts-ignore */
        icon = dbIcon.emoji + " ";
        /* @ts-ignore */
      } else if (dbIcon.type === "external") {
        /* @ts-ignore */
        icon = `<img src="${dbIcon.external.url}" width="32" /> `;
      }
      /* @ts-ignore */
    } catch (error) {}

    return settings.pageEmoji !== "last_emoji"
      ? `${icon}${title}`
      : `${title}${icon}`;
  }
}

export default NotionAPIWrapper;
