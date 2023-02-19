import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Backend from '../../../lib/backend';
import NotionObject from '../../../lib/interfaces/NotionObject';

interface UseFavorites {
  error: unknown;
  loading: boolean;
  favorites: NotionObject[];
  setFavorites: Dispatch<SetStateAction<NotionObject[]>>;
}

export default function useFavorites(backend: Backend): UseFavorites {
  const [favorites, setFavorites] = useState<NotionObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(undefined);

  useEffect(() => {
    backend
      .getFavorites()
      .then((input) => {
        setFavorites(input);
        setLoading(false);
      })
      .catch((fetchError) => {
        setLoading(false);
        setError(fetchError);
      });
  }, []);
  return { loading, favorites, setFavorites, error };
}
