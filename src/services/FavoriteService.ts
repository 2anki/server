import { FavoritesRepository } from '../data_layer/FavoritesRepository';
import Favorites from '../data_layer/public/Favorites';
import { NewFavorite, isValidFavoriteInput } from '../entities/favorites';
import AddToFavoritesUseCase from '../usecases/favorites/AddToFavoritesUseCase';
import DeleteMissingFavoritesUseCase from '../usecases/favorites/DeleteMissingFavoritesUseCase';
import GetAllFavoritesByOwnerUseCase from '../usecases/favorites/GetAllFavoritesByOwnerUseCase';
import DeleteFavoriteUseCase from '../usecases/favorites/DeleteFavoriteUseCase';
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
    // return favorites;

    try {
      // XXX: This should be moved to a different service.
      const api = await notionService.getNotionAPI(owner);
      if (!api) {
        return [];
      }

      return await Promise.all(
        favorites.map((f: Favorites) =>
          f.type === 'page'
            ? api.getPage(f.object_id)
            : api.getDatabase(f.object_id)
        )
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}

export default FavoriteService;
