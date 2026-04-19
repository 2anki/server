import {
  GetBlockResponse,
  GetPageResponse,
  ListBlockChildrenResponse,
  QueryDataSourceResponse,
} from '@notionhq/client/build/src/api-endpoints';

export type Mock =
  | 'ListBlockChildrenResponse'
  | 'GetPageResponse'
  | 'GetDatabaseResponse'
  | 'QueryDataSourceResponse'
  | 'GetBlockResponse';

export type Payload =
  | ListBlockChildrenResponse
  | GetPageResponse
  | GetBlockResponse
  | QueryDataSourceResponse;
