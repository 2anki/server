import {
  GetBlockResponse,
  GetPageResponse,
  ListBlockChildrenResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';
import NotionAPIWrapper, { GetBlockParams } from '../NotionAPIWrapper';
import dataMockPath from './helpers/dataMockPath';
import { mockDataExists } from './helpers/mockDataExists';
import getPayload from './helpers/getPayload';
import savePayload from './helpers/savePayload';

export default class MockNotionAPI extends NotionAPIWrapper {
  async getBlocks({
    id,
    all,
  }: GetBlockParams): Promise<ListBlockChildrenResponse> {
    if (mockDataExists('ListBlockChildrenResponse', id)) {
      return getPayload(
        dataMockPath('ListBlockChildrenResponse', id)
      ) as ListBlockChildrenResponse;
    }
    const blocks = await super.getBlocks({
      createdAt: '',
      lastEditedAt: '',
      id,
      all,
    });
    savePayload(dataMockPath('ListBlockChildrenResponse', id), blocks);
    return blocks;
  }

  async getPage(id: string): Promise<GetPageResponse | null> {
    if (mockDataExists('GetPageResponse', id)) {
      return getPayload(dataMockPath('GetPageResponse', id)) as GetPageResponse;
    }
    const page = await super.getPage(id);
    if (page) {
      savePayload(dataMockPath('GetPageResponse', id), page);
    }
    return page;
  }

  async getBlock(id: string): Promise<GetBlockResponse> {
    if (mockDataExists('GetBlockResponse', id)) {
      return getPayload(
        dataMockPath('GetBlockResponse', id)
      ) as GetBlockResponse;
    }
    const block = await super.getBlock(id);
    savePayload(dataMockPath('GetBlockResponse', id), block);
    return block;
  }

  async queryDatabase(
    id: string,
    all?: boolean
  ): Promise<QueryDatabaseResponse> {
    if (mockDataExists('QueryDatabaseResponse', id)) {
      return getPayload(
        dataMockPath('QueryDatabaseResponse', id)
      ) as QueryDatabaseResponse;
    }
    const query = await super.queryDatabase(id, all);
    savePayload(dataMockPath('QueryDatabaseResponse', id), query);
    return query;
  }
  // do we need to mock search?
}
