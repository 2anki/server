import Blocks from '../../../schemas/public/Blocks';
import DB from '../../storage/db';
import isAfter from 'date-fns/isAfter';
import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';

export async function getBlockCache(
  id: string,
  owner: string,
  lastEditedAt: string | Date
): Promise<ListBlockChildrenResponse | undefined> {
  const cache: Blocks = await DB('blocks')
    .where({ object_id: id, owner })
    .first();
  // We did not find a cache entry or the user has made changes
  if (!cache || isAfter(new Date(lastEditedAt), cache.last_edited_time)) {
    return undefined;
  }
  // Found cache and update the fetch request (used for performance analysis)
  DB('blocks')
    .where({ object_id: id })
    .update({
      fetch: cache.fetch + 1,
    });
  return cache.payload as ListBlockChildrenResponse;
}
