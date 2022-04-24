import { useHistory } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { EmptyContainer } from './styled';
import SearchBar from './SearchBar';
import NotionObject from '../../../lib/interfaces/NotionObject';
import ListSearchResults from './ListSearchResults';
import Favorites from './Favorites';
import useFavorites from '../helpers/useFavorites';
import Backend from '../../../lib/Backend';

interface SearchPresenterProps {
  inProgress: boolean;
  myPages: NotionObject[];
  setSearchQuery: Dispatch<SetStateAction<string>>;
  triggerSearch: (force: boolean) => void;
  errorNotification: Error | null;
}

export default function SearchPresenter(
  props: SearchPresenterProps,
) {
  const history = useHistory();
  const {
    inProgress,
    myPages,
    setSearchQuery,
    triggerSearch,
    errorNotification,
  } = props;

  const [favorites, setFavorites] = useFavorites(new Backend());

  return (
    <>
      <SearchBar
        inProgress={inProgress}
        onSearchQueryChanged={(s) => {
          history.push({
            pathname: '/search',
            search: `?q=${s}`,
          });
          setSearchQuery(s);
        }}
        onSearchClicked={() => triggerSearch(false)}
      />
      <Favorites setFavorites={setFavorites} favorites={favorites} />
      <div className="column is-main-content">
        {(!myPages || myPages.length < 1) && (
        <EmptyContainer>
          {errorNotification && (
          <div className="my-4 notification is-danger">
            <p>{errorNotification.message}</p>
          </div>
          )}
          {!errorNotification && (
          <div className="subtitle is-3 my-4">
            No search results, try typing something above 👌🏾
          </div>
          )}
        </EmptyContainer>
        )}
        <ListSearchResults setFavorites={setFavorites} results={myPages} />
      </div>
    </>
  );
}
