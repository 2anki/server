import searchStyles from '../SearchPage.module.css';

interface SearchBarProps {
  value: string;
  onSearchQueryChanged: (query: string) => void;
  onSearchClicked: () => void;
  inProgress: boolean;
}

function SearchBar({
  value,
  onSearchQueryChanged,
  onSearchClicked,
  inProgress,
}: SearchBarProps) {
  return (
    <div>
      <label className={searchStyles.searchLabel} htmlFor="notion-search-input">
        Search Notion
      </label>
      <input
        id="notion-search-input"
        value={value}
        type="text"
        className={searchStyles.searchInput}
        placeholder="Start typing..."
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            onSearchClicked();
          }
        }}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onSearchQueryChanged(event.target.value);
        }}
      />
      <div className={searchStyles.returnHint}>Results update as you type</div>
      <div
        className={searchStyles.searchingIndicator}
        aria-live="polite"
        data-visible={inProgress ? 'true' : 'false'}
      >
        <span className={searchStyles.searchingDot} />
        <span className={searchStyles.searchingDot} /> Searching…
      </div>
    </div>
  );
}

export default SearchBar;
