import { useState } from "react";
import styled from "styled-components";

const SearchInput = styled.input`
  width: 80vw;
`;

// TODO: handle the enter key is pressed
const SearchBar = ({ onSearchQueryChanged, onSearchClicked, inProgress }) => {
  const [enabled, setEnabled] = useState(false);
  return (
    <>
      <div className="field has-addons">
        <div className="control">
          <SearchInput
            className="input is-large"
            type="text"
            placeholder="Find a page"
            onChange={(event) => {
              onSearchQueryChanged(event.target.value);
              setEnabled(event.target.value.length > 3);
            }}
          />
        </div>
        <div className="control" onClick={onSearchClicked}>
          <button
            className={`button is-info is-large ${
              inProgress ? "is-loading" : ""
            }`}
            disabled={!enabled}
          >
            Search
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
