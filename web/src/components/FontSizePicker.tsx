import styles from '../styles/shared.module.css';

interface FontPickerDelegate {
  fontSize: string;
  pickedFontSize: (fs: string) => void;
}

function FontSizePicker(delegate: Readonly<FontPickerDelegate>) {
  const { fontSize, pickedFontSize } = delegate;
  const displayValue = fontSize || '20';

  return (
    <div className={styles.flexColumn}>
      <label htmlFor="font-size">
        <strong>Font size</strong>
      </label>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: '0.125rem 0 0.375rem' }}>
        Controls the base font size in your generated cards. Range: 10–100 px.
      </p>
      <div className={styles.flexRow} style={{ width: '100%', gap: '0.75rem', alignItems: 'center' }}>
        <input
          id="font-size"
          name="font-size"
          type="range"
          min="10"
          max="100"
          value={displayValue}
          onChange={(event) => pickedFontSize(event.target.value)}
          style={{ flex: 1, accentColor: 'var(--color-primary)' }}
        />
        <span style={{ minWidth: '3.5rem', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {displayValue} px
        </span>
      </div>
    </div>
  );
}

export default FontSizePicker;
