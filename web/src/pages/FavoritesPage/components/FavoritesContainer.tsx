import Backend from '../../../lib/backend';
import { SkeletonList } from '../../../components/Skeleton/Skeleton';
import styles from '../../../styles/shared.module.css';

import FavoritesPresenter from './FavoritesPresenter';
import useFavorites from '../helpers/useFavorites';
import { redirectOnError } from '../../../components/shared/redirectOnError';
import { ErrorHandlerType } from '../../../components/errors/helpers/getErrorMessage';

interface FavoritesContentProps {
  backend: Backend;
  setError: ErrorHandlerType;
}

export default function FavoritesContainer({
  setError,
  backend,
}: FavoritesContentProps) {
  const { loading, favorites, setFavorites, error } = useFavorites(backend);

  if (error) {
    redirectOnError(error);
    return null;
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Favorites</h1>
        <p className={styles.subtitle}>
          Pages you&apos;ve starred for quick access.
        </p>
      </header>
      {loading ? (
        <SkeletonList count={5} />
      ) : (
        <FavoritesPresenter
          favorites={favorites}
          setFavorites={setFavorites}
          setError={setError}
        />
      )}
    </div>
  );
}
