import { FavoritesRepository } from '../../data_layer/FavoritesRepository';
import { FavoritesInitializer } from '../../data_layer/public/Favorites';

class GetAllFavoritesByOwnerUseCase {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  execute(ownerId: string): Promise<FavoritesInitializer[]> {
    return this.favoritesRepository.getAllByOwner(ownerId);
  }
}

export default GetAllFavoritesByOwnerUseCase;
