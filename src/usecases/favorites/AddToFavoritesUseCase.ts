import { FavoritesRepository } from '../../data_layer/FavoritesRepository';
import { NewFavorite } from '../../entities/favorites';

class AddToFavoritesUseCase {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async execute({ object_id, owner, type }: NewFavorite): Promise<void> {
    const favorite = await this.favoritesRepository.findById(object_id);

    if (favorite) {
      throw new Error('Already in favorites');
    }

    await this.favoritesRepository.addToFavorites({ object_id, owner, type });
  }
}

export default AddToFavoritesUseCase;
