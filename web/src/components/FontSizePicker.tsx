import { useState } from "react";

const FontSizePicker = () => {
  const [fontSize, setFontSize] = useState(20);

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
          }}
        >
          <input defaultValue={fontSize} name="font-size" hidden />
          {[32, 26, 20, 12, 10].map((fontPreset) => (
            <p key={fontPreset}>
              <span
                style={{
                  border: "1px solid lightgray",
                  borderRadius: "5px",
                  fontSize: `${fontPreset}px`,
                  padding: "1rem",
                  borderRight: "5px",
                  margin: "0 8px",
                  color: `${fontPreset === fontSize ? "#00d1b2" : "black"}`,
                }}
                onClick={() => {
                  setFontSize(fontPreset);
                  localStorage.setItem("font-size", fontPreset.toString());
                }}
              >
                Aa
              </span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FontSizePicker;
