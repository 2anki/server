interface Prop {
  onDelete: () => void;
}

export function DeleteButton({ onDelete }: Prop) {
  return <button
    aria-label="delete"
    type="button"
    className="is-small button transparent"
    onClick={() => onDelete()}
  ><i className="fa-sharp fa-solid fa-trash" /></button>;
}
