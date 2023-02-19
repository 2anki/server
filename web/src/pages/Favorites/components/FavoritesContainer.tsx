import { ErrorHandlerType } from '../../../components/errors/helpers/types';
import { PageContainer } from '../../../components/styled';
import Backend from '../../../lib/backend';
import LoadingIndicator from '../../../components/Loading';

import FavoritesPresenter from './FavoritesPresenter';
import useFavorites from '../helpers/useFavorites';
import { redirectOnError } from '../../../components/shared/redirectOnError';

interface FavoritesContentProps {
  backend: Backend;
  setError: ErrorHandlerType;
}

export default function FavoritesContainer({
  setError,
  backend,
}: FavoritesContentProps) {
  const { loading, favorites, setFavorites, error } = useFavorites(backend);
  if (loading) return <LoadingIndicator />;

  if (error) {
    redirectOnError(error);
    return null;
  }

  return (
    <PageContainer>
      <FavoritesPresenter
        favorites={favorites}
        setFavorites={setFavorites}
        setError={setError}
      />
    </PageContainer>
  );
}
