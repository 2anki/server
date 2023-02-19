import { useHistory } from 'react-router-dom';
import SearchBar from './SearchBar';
import NotionObject from '../../../lib/interfaces/NotionObject';
import ListSearchResults from './ListSearchResults';
import useFavorites from '../helpers/useFavorites';
import Backend from '../../../lib/backend';
import { ErrorHandlerType } from '../../../components/errors/helpers/types';
import { StickyContainer } from './styled';

interface SearchPresenterProps {
  inProgress: boolean;
  myPages: NotionObject[];
  setSearchQuery: (value: string) => void;
  triggerSearch: (force: boolean) => void;
  setError: ErrorHandlerType;
}

export default function SearchPresenter(props: SearchPresenterProps) {
  const history = useHistory();
  const { inProgress, myPages, setSearchQuery, triggerSearch, setError } =
    props;
  const [, setFavorites] = useFavorites(new Backend());

  return (
    <>
      <StickyContainer>
        <SearchBar
          inProgress={inProgress}
          onSearchQueryChanged={(s) => {
            history.push({
              pathname: '/search',
              search: `?q=${s}`
            });
            setSearchQuery(s);
          }}
          onSearchClicked={() => triggerSearch(false)}
        />
      </StickyContainer>
      <ListSearchResults
        setError={setError}
        setFavorites={setFavorites}
        results={myPages}
      />
    </>
  );
}
