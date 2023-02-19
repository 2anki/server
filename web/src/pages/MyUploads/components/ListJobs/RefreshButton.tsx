interface Prop {
  onRefresh: () => void;
}

export function RefreshButton({ onRefresh }: Prop) {
  return <button onClick={() => onRefresh()} aria-label="refresh" type="button"
                 className="button is-small mx-2"><i
    className="fa-solid fa-arrows-rotate" />
  </button>;
}