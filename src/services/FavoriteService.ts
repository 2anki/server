import { FavoritesRepository } from '../data_layer/FavoritesRepository';
import Favorites, {
  FavoritesInitializer,
} from '../data_layer/public/Favorites';

class FavoriteService {
  constructor(private repository: FavoritesRepository) {}

  isValidInput(object_id: string, type: string) {
    return object_id && type;
  }

  create(newFavorite: FavoritesInitializer) {
    return this.repository.create(newFavorite);
  }

  delete(id: string, owner: number) {
    return this.repository.remove(id, owner);
  }

  getFavoritesByOwner(owner: number) {
    return this.repository.getAll(owner);
  }

  deleteMissingFavorites(owner: any) {
    this.repository.deleteAll(owner);
  }

  mapToNotionBlocks(favorites: any, api: any) {
    return Promise.all(
      favorites.map((f: Favorites) =>
        f.type === 'page'
          ? api.getPage(f.object_id)
          : api.getDatabase(f.object_id)
      )
    );
  }
}

export default FavoriteService;
