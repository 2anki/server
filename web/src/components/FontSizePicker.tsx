import styles from '../styles/shared.module.css';

interface FontPickerDelegate {
  fontSize: string;
  pickedFontSize: (fs: string) => void;
}

function FontSizePicker(delegate: Readonly<FontPickerDelegate>) {
  const { fontSize, pickedFontSize } = delegate;

  return (
    <div className={styles.flexColumn}>
      <label htmlFor="font-size">
        <strong>Font Size</strong>
      </label>
      <div className={styles.flexRow} style={{ width: '100%', gap: '0.75rem' }}>
        <input
          id="font-size"
          name="font-size"
          type="range"
          min="10"
          max="100"
          value={fontSize}
          onChange={(event) => pickedFontSize(event.target.value)}
          style={{ flex: 1 }}
        />
        <span style={{ minWidth: '3rem', textAlign: 'right', fontSize: 'var(--text-sm)' }}>
          {fontSize}px
        </span>
      </div>
    </div>
  );
}

export default FontSizePicker;
