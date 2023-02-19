import { Dispatch, SetStateAction } from 'react';
import Favorites from './Favorites';

import { ErrorHandlerType } from '../../../components/errors/helpers/types';
import NotionObject from '../../../lib/interfaces/NotionObject';

interface Props {
  favorites: NotionObject[];
  setError: ErrorHandlerType;
  setFavorites: Dispatch<SetStateAction<NotionObject[]>>;
}

export default function FavoritesPresenter({
                                             setError,
                                             setFavorites,
                                             favorites
                                           }: Props) {
  return (
    <Favorites
      setError={setError}
      setFavorites={setFavorites}
      favorites={favorites}
    />
  );
}
