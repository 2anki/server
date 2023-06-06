import { ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';
import isAfter from 'date-fns/isAfter';
import { Knex } from 'knex';

import Blocks from '../../../data_layer/public/Blocks';

export interface BlocksCacheInitializer {
  database: Knex;
  owner: string;
  id: string;
  lastEditedAt: string | Date;
}

export async function getBlockCache({
  database,
  id,
  owner,
  lastEditedAt,
}: BlocksCacheInitializer): Promise<ListBlockChildrenResponse | undefined> {
  const cache: Blocks = await database('blocks')
    .where({ object_id: id, owner })
    .first();
  // We did not find a cache entry or the user has made changes
  if (!cache || isAfter(new Date(lastEditedAt), cache.last_edited_time)) {
    return undefined;
  }
  // Found cache and update the fetch request (used for performance analysis)
  database('blocks')
    .where({ object_id: id })
    .update({
      fetch: cache.fetch + 1,
    });
  return cache.payload as ListBlockChildrenResponse;
}
