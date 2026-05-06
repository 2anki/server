import { Dispatch, SetStateAction } from 'react';
import Favorites from './Favorites';

import { ErrorHandlerType } from '../../../components/errors/helpers/getErrorMessage';
import NotionObject from '../../../lib/interfaces/NotionObject';
import { getVisibleText } from '../../../lib/text/getVisibleText';
import styles from '../../../styles/shared.module.css';

interface Props {
  favorites: NotionObject[];
  setError: ErrorHandlerType;
  setFavorites: Dispatch<SetStateAction<NotionObject[]>>;
}

export default function FavoritesPresenter({
  setError,
  setFavorites,
  favorites,
}: Props) {
  if (favorites.length === 0) {
    return (
      <div className={styles.emptyState}>
        {getVisibleText('favorites.empty')}
      </div>
    );
  }
  return (
    <Favorites
      setError={setError}
      setFavorites={setFavorites}
      favorites={favorites}
    />
  );
}
