import { NotionDatabase, NotionPage } from '../../generated/data-contracts';

export function getResourceUrl(p: NotionDatabase | NotionPage) {
  if ('url' in p) {
    return p.url;
  }
  return undefined;
}
