import {
  Dispatch, SetStateAction, useEffect, useState,
} from 'react';
import Backend from '../../../lib/Backend';
import NotionObject from '../../../lib/interfaces/NotionObject';

export default function useFavorites(
  backend: Backend,
): [
  favorites: NotionObject[],
  setFavorites: Dispatch<SetStateAction<NotionObject[]>>,
  ] {
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    backend.getFavorites().then((input) => {
      setFavorites(input);
    });
  }, []);
  return [favorites, setFavorites];
}
