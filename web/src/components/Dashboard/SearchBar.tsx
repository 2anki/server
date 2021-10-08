import styled from "styled-components";

const SearchInput = styled.input`
  width: 80vw;
`;

const SearchBar = ({ onSearchQueryChanged, onSearchClicked }) => {
  return (
    <>
      <div className="field has-addons">
        <div className="control">
          <SearchInput
            className="input is-large"
            type="text"
            placeholder="Find a page"
            onChange={(event) => onSearchQueryChanged(event.target.value)}
          />
        </div>
        <div className="control" onClick={onSearchClicked}>
          <a href="#a" className="button is-info is-large">
            Search
          </a>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
