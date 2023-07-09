import { getDatabase } from '..';
import DeleteFavoriteUseCase from '../../usecases/favorites/DeleteFavoriteUseCase';
import GetAllFavoritesByOwnerUseCase from '../../usecases/favorites/GetAllFavoritesByOwnerUseCase';
import { FavoritesRepository } from '../FavoritesRepository';

export const purgeMissingFavorites = async (owner: string) => {
  const favoritesRepository = new FavoritesRepository(getDatabase());
  const allFavorites = await new GetAllFavoritesByOwnerUseCase(
    favoritesRepository
  ).execute(owner);
  const deleteUseCase = new DeleteFavoriteUseCase(favoritesRepository);

  return Promise.all(
    allFavorites.map((f) => deleteUseCase.execute(f.object_id, f.owner))
  );
};
