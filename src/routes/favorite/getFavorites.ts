import { Request, Response } from 'express';
import all from '../../lib/favorite/all';
import Favorites from '../../schemas/public/Favorites';
import { getNotionAPI } from '../../lib/notion/helpers/getNotionAPI';
import { APIResponseError } from '@notionhq/client';
import DB from '../../lib/storage/db';

export default async function getFavorites(req: Request, res: Response) {
  const { owner } = res.locals;
  const api = await getNotionAPI(req, res);
  const favorites = await all(owner);

  try {
    const notionBlocks = await Promise.all(
      favorites.map((f: Favorites) =>
        f.type === 'page'
          ? api.getPage(f.object_id)
          : api.getDatabase(f.object_id)
      )
    );
    res.json(notionBlocks);
  } catch (err) {
    if (err instanceof APIResponseError) {
      console.info('purging favorites for');
      await DB('favorites').delete().where({
        owner,
      });
    }
    res.json([]);
  }
}
