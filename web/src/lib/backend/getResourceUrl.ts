import {
  GetDatabaseResponse,
  GetPageResponse,
  PageObjectResponse,
  PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export function getResourceUrl(
  p:
    | GetDatabaseResponse
    | GetPageResponse
    | PageObjectResponse
    | PartialPageObjectResponse
) {
  if ('url' in p) {
    return p.url;
  }
  return undefined;
}
