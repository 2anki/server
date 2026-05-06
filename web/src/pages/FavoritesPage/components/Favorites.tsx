import { Dispatch, SetStateAction } from 'react';
import { ErrorHandlerType } from '../../../components/errors/helpers/getErrorMessage';
import NotionObject from '../../../lib/interfaces/NotionObject';
import ListSearchResults from '../../SearchPage/components/ListSearchResults';

interface FavoritesProps {
  setError: ErrorHandlerType;
  favorites: NotionObject[];
  setFavorites: Dispatch<SetStateAction<NotionObject[]>>;
}

export default function Favorites(props: FavoritesProps) {
  const { favorites, setFavorites, setError } = props;
  if (favorites.length < 1) return null;

  return (
    <ListSearchResults
      setError={setError}
      setFavorites={setFavorites}
      handleEmpty={false}
      results={favorites}
    />
  );
}
