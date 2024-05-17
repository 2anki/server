import { APIResponseError } from '@notionhq/client';
import { FavoritesRepository } from '../data_layer/FavoritesRepository';
import Favorites from '../data_layer/public/Favorites';
import { NewFavorite, isValidFavoriteInput } from '../entities/favorites';
import AddToFavoritesUseCase from '../usecases/favorites/AddToFavoritesUseCase';
import DeleteFavoriteUseCase from '../usecases/favorites/DeleteFavoriteUseCase';
import GetAllFavoritesByOwnerUseCase from '../usecases/favorites/GetAllFavoritesByOwnerUseCase';
import NotionService from './NotionService';

class FavoriteService {
  constructor(private repository: FavoritesRepository) {}

  async create(newFavorite: NewFavorite): Promise<boolean> {
    if (!isValidFavoriteInput(newFavorite.object_id, newFavorite.type)) {
      return false;
    }

    const useCase = new AddToFavoritesUseCase(this.repository);
    await useCase.execute(newFavorite);
    return true;
  }

  async delete(id: string, owner: string): Promise<boolean> {
    const useCase = new DeleteFavoriteUseCase(this.repository);
    await useCase.execute(id, owner);
    return true;
  }

  async getFavoritesByOwner(owner: string, notionService: NotionService) {
    if (!owner) {
      return [];
    }

    const useCase = new GetAllFavoritesByOwnerUseCase(this.repository);
    const favorites = await useCase.execute(owner);

    /**
     * XXX: This should be moved to a different service.
     * What is happening here is that we fetch the Notion block so we can present the user
     * with a rich object (with title and emoji) instead of just the ID.
     */
    const api = await notionService.getNotionAPI(owner);
    if (!api) {
      return [];
    }

    return Promise.all(
      favorites.map((f: Favorites) =>
        (f.type === 'page'
          ? api.getPage(f.object_id)
          : api.getDatabase(f.object_id)
        ).catch((error) => {
          if (error instanceof APIResponseError) {
            this.delete(f.object_id, owner);
          }
        })
      )
    );
  }
}

export default FavoriteService;
