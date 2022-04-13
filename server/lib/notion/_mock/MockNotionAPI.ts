import {
  GetBlockResponse,
  GetPageResponse,
  ListBlockChildrenResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import NotionAPIWrapper from "../NotionAPIWrapper";
import dataMockPath from "./helpers/dataMockPath";
import { mockDataExists } from "./helpers/mockDataExists";
import getPayload from "./helpers/getPayload";
import savePayload from "./helpers/savePayload";

export default class MockNotionAPI extends NotionAPIWrapper {
  async getBlocks(
    id: string,
    all?: boolean
  ): Promise<ListBlockChildrenResponse> {
    if (mockDataExists("ListBlockChildrenResponse", id)) {
      console.info("block exists using mock", id);
      return getPayload(dataMockPath("ListBlockChildrenResponse", id));
    }
    const blocks = await super.getBlocks(id, all);
    savePayload(dataMockPath("ListBlockChildrenResponse", id), blocks);
    return blocks;
  }

  async getPage(id: string): Promise<GetPageResponse | null> {
    if (mockDataExists("GetPageResponse", id)) {
      console.info("page exists using mock", id);
      return getPayload(dataMockPath("GetPageResponse", id));
    }
    const page = await super.getPage(id);
    savePayload(dataMockPath("GetPageResponse", id), page);
    return page;
  }

  async getBlock(id: string): Promise<GetBlockResponse> {
    if (mockDataExists("GetBlockResponse", id)) {
      console.info("block exists using mock", id);
      return getPayload(dataMockPath("GetBlockResponse", id));
    }
    const block = await super.getBlock(id);
    savePayload(dataMockPath("GetBlockResponse", id), block);
    return block;
  }

  async queryDatabase(
    id: string,
    all?: boolean
  ): Promise<QueryDatabaseResponse> {
    if (mockDataExists("QueryDatabaseResponse", id)) {
      console.info("database exists using mock", id);
      return getPayload(dataMockPath("QueryDatabaseResponse", id));
    }
    const query = await super.queryDatabase(id, all);
    savePayload(dataMockPath("QueryDatabaseResponse", id), query);
    return query;
  }
  // do we need to mock search?
}
