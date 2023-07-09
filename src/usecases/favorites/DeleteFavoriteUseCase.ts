import { FavoritesRepository } from '../../data_layer/FavoritesRepository';

class DeleteFavoriteUseCase {
  constructor(private favoriteRepository: FavoritesRepository) {}

  async execute(favoriteId: string, owner: string | number): Promise<void> {
    const favorite = await this.favoriteRepository.findById(favoriteId);

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    await this.favoriteRepository.remove(favoriteId, owner);
  }
}

export default DeleteFavoriteUseCase;
