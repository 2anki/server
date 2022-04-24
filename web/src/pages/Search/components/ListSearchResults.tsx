import { Dispatch, SetStateAction } from 'react';
import NotionObject from '../../../lib/interfaces/NotionObject';
import SearchObjectEntry from './SearchObjectEntry';

interface ListSearchResultsProps {
  results: NotionObject[];
  setFavorites: Dispatch<SetStateAction<NotionObject[]>>;
  handleEmpty?: boolean;
}

export default function ListSearchResults(
  props: ListSearchResultsProps,
): JSX.Element {
  const { results, handleEmpty, setFavorites } = props;
  const isEmpty = results.length < 1;

  if (isEmpty && handleEmpty) {
    return (
      <div className="subtitle is-3 my-4">
        No search results, try typing something above 👌🏾
      </div>
    );
  }
  return (
    <>
      {results.map((p) => (
        <SearchObjectEntry
          setFavorites={setFavorites}
          isFavorite={p.isFavorite}
          type={p.object}
          key={p.url}
          title={p.title}
          icon={p.icon}
          url={p.url}
          id={p.id}
        />
      ))}
    </>
  );
}

ListSearchResults.defaultProps = {
  handleEmpty: true,
};
