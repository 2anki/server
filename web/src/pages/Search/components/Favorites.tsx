import { Dispatch, SetStateAction } from 'react';
import NotionObject from '../../../lib/interfaces/NotionObject';
import ListSearchResults from './ListSearchResults';

interface FavoritesProps {
  favorites: NotionObject[];
  setFavorites: Dispatch<SetStateAction<NotionObject[]>>;
}

export default function Favorites(props: FavoritesProps) {
  const { favorites, setFavorites } = props;
  if (favorites.length < 1) return null;

  return (
    <div className="box mt-4 mb-0">
      <h3 className="title is-4">Favorites</h3>
      <ListSearchResults
        setFavorites={setFavorites}
        handleEmpty={false}
        results={favorites}
      />
    </div>
  );
}
