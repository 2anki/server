import { SearchInput } from './styled';
import { getQueryValue } from '../helpers/getQueryValue';

interface SearchBarProps {
  onSearchQueryChanged: (query: string) => void;
  onSearchClicked: () => void;
  inProgress: boolean;
}

function SearchBar({
                     onSearchQueryChanged,
                     onSearchClicked,
                     inProgress
                   }: SearchBarProps) {
  return (
    <div className="my-1 mt-4 has-text-centered is-flex is-justify-content-center">
      <div className="field has-addons">
        <div className="control">
          <SearchInput
            defaultValue={getQueryValue()}
            className="input"
            type="text"
            placeholder="  🔍 🅰  📑 "
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearchClicked();
              }
            }}
            onChange={(event) => {
              onSearchQueryChanged(event.target.value);
            }}
          />
        </div>
        <div className="control">
          <button
            type="button"
            onClick={onSearchClicked}
            className={`button ${
              inProgress ? 'is-loading is-light' : 'is-info'
            }`}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
