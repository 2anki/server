const SearchBar = ({ onSearchQueryChanged, onSearchClicked }) => {
  return (
    <>
      <div className="field has-addons">
        <div className="control">
          <input
            className="input is-large"
            type="text"
            placeholder="Find a page"
            onChange={(event) => onSearchQueryChanged(event.target.value)}
          />
        </div>
        <div className="control" onClick={onSearchClicked}>
          <a className="button is-info is-large">Search</a>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
