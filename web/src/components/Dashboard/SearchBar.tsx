import { useState } from "react";
import styled from "styled-components";

const SearchInput = styled.input`
  width: 80vw;
`;
const SearchContainer = styled.div`
  position: sticky;
  margin-bottom: 2rem;
`;

const SearchButton = styled.button`
  img {
    filter: invert(1);
  }
`;

// TODO: handle the enter key is pressed
const SearchBar = ({ onSearchQueryChanged, onSearchClicked, inProgress }) => {
  const [enabled, setEnabled] = useState(false);
  return (
    <SearchContainer>
      <div className="field has-addons">
        <div className="control">
          <SearchInput
            className="input is-large"
            type="text"
            placeholder="  🔍 🅰  📑 "
            onChange={(event) => {
              onSearchQueryChanged(event.target.value);
              setEnabled(event.target.value.length > 3);
            }}
          />
        </div>
        <div className="control" onClick={onSearchClicked}>
          <SearchButton
            className={`button is-large ${
              inProgress ? "is-loading is-light" : "is-info"
            }`}
            disabled={!enabled}
          >
            {/* // TODO: hide image when loading */}
            <img alt="search" src="/icons/search.svg" width="32px"></img>
          </SearchButton>
        </div>
      </div>
    </SearchContainer>
  );
};

export default SearchBar;
