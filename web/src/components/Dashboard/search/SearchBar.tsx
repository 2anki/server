import styled from 'styled-components';

const SearchInput = styled.input`
  width: 60vw;
  max-width: 640px;
`;
const SearchContainer = styled.div`
  position: sticky;
  margin: 0 auto;
  display: flex;
  justify-content: center;
`;

interface SearchBarProps {
  onSearchQueryChanged: (query: string) => void;
  onSearchClicked: () => void;
  inProgress: boolean;
}

function SearchBar({ onSearchQueryChanged, onSearchClicked, inProgress }: SearchBarProps) {
  return (
    <SearchContainer>
      <div className="field has-addons">
        <div className="control">
          <SearchInput
            className="input"
            type="text"
            placeholder="  🔍 🅰  📑 "
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchClicked();
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
    </SearchContainer>
  );
}

export default SearchBar;
