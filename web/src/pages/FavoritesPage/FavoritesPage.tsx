import FavoritesContainer from './components/FavoritesContainer';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';

interface FavoritesPageProps {
  setError: ErrorHandlerType;
}

export function FavoritesPage({ setError }: FavoritesPageProps) {
  return <FavoritesContainer backend={get2ankiApi()} setError={setError} />;
}
