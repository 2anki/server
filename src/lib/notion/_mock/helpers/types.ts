import {
  GetBlockResponse,
  GetPageResponse,
  ListBlockChildrenResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

export type Mock =
  | 'ListBlockChildrenResponse'
  | 'GetPageResponse'
  | 'GetDatabaseResponse'
  | 'QueryDatabaseResponse'
  | 'GetBlockResponse';

export type Payload =
  | ListBlockChildrenResponse
  | GetPageResponse
  | GetBlockResponse
  | QueryDatabaseResponse;
