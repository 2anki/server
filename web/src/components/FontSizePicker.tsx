interface FontPickerDelegate {
  fontSize: string;
  pickedFontSize: (fs: string) => void;
}

function FontSizePicker(delegate: FontPickerDelegate) {
  const { fontSize, pickedFontSize } = delegate;

  return (
    <div className="field">
      <div className="control">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0',
            flexDirection: 'column',
          }}
        >
          <label htmlFor="font-size" className="label">
            Font Size
            <input
              id="font-size"
              name="font-size"
              type="range"
              min="10"
              max="100"
              value={fontSize}
              onChange={(event) => pickedFontSize(event.target.value)}
            />
          </label>
          <span style={{ fontSize: `${fontSize}px` }}>{fontSize}</span>
        </div>
      </div>
    </div>
  );
}

export default FontSizePicker;
