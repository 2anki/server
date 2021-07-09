interface FontPickerDelegate {
  fontSize: string;
  pickedFontSize: (fs: string) => void;
}

const FontSizePicker = (delegate: FontPickerDelegate) => {
  return (
    <div className="field">
      <label className="label">Font Size</label>
      <div className="control">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0",
            flexDirection: "column",
          }}
        >
          <input
            name="font-size"
            type="range"
            min="10"
            max="100"
            value={delegate.fontSize}
            onChange={(event) => delegate.pickedFontSize(event.target.value)}
          />
          <label style={{ fontSize: `${delegate.fontSize}px` }}>
            {delegate.fontSize}
          </label>
        </div>
      </div>
    </div>
  );
};

export default FontSizePicker;
