import styles from '../styles/shared.module.css';

interface FontPickerDelegate {
  fontSize: string;
  pickedFontSize: (fs: string) => void;
}

function FontSizePicker(delegate: FontPickerDelegate) {
  const { fontSize, pickedFontSize } = delegate;

  return (
    <div className={styles.flexColumn}>
      <label htmlFor="font-size">
        <strong>Font Size</strong>
      </label>
      <div
        className={styles.flexRow}
        style={{ alignItems: 'center', gap: '1rem' }}
      >
        <input
          id="font-size"
          name="font-size"
          type="range"
          min="10"
          max="100"
          value={fontSize}
          onChange={(event) => pickedFontSize(event.target.value)}
          style={{
            writingMode: 'vertical-lr',
            direction: 'rtl',
            height: '100px',
          }}
        />
        <span style={{ fontSize: `${fontSize}px`, overflow: 'hidden' }}>
          {fontSize}
        </span>
      </div>
    </div>
  );
}

export default FontSizePicker;
