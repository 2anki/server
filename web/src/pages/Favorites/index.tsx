import FavoritesContainer from './components/FavoritesContainer';
import Backend from '../../lib/backend';
import { ErrorHandlerType } from '../../components/errors/helpers/types';

interface FavoritesPageProps {
  setError: ErrorHandlerType;
}

const backend = new Backend();
function FavoritesPage({ setError }: FavoritesPageProps) {
  return <FavoritesContainer backend={backend} setError={setError} />;
}

export default FavoritesPage;
