import { Request, Response } from 'express';
import all from '../../lib/favorite/all';
import Favorites from '../../schemas/public/Favorites';
import { getNotionAPI } from '../../lib/notion/helpers/getNotionAPI';

export default async function getFavorites(req: Request, res: Response) {
  const { owner } = res.locals;
  const api = await getNotionAPI(req, res);

  console.log('getFavorites');
  const favorites = await all(owner);
  console.log(favorites);
  const notionBlocks = await Promise.all(
    favorites.map(async (f: Favorites) =>
      f.type === 'page'
        ? api.getPage(f.object_id)
        : api.getDatabase(f.object_id)
    )
  );
  res.json(notionBlocks);
}
