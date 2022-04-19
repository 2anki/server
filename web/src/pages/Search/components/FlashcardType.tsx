interface FlashcardTypeProps {
  active: boolean;
  name: string;
  onSwitch: (name: string) => void;
}

export default function FlashcardType(props: FlashcardTypeProps) {
  const { name, onSwitch, active } = props;
  return (
    <button
      type="button"
      aria-label="tag"
      onClick={() => onSwitch(name)}
      className={`tag is-small mx-1 ${active ? 'is-link' : ''}`}
    >
      {name}
    </button>
  );
}
