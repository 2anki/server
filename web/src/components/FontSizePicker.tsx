import { useState } from "react";

import { Columns, Column } from "trunx";
interface FontPickerDelegate {
  fontSize: number;
  pickedFontSize: (fs: number) => void;
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
          }}
        >
          <input defaultValue={delegate.fontSize} name="font-size" hidden />
          <Columns>
            {[32, 26, 20, 12, 10].map((fontPreset) => (
              <Column key={fontPreset}>
                <button
                  className="button"
                  style={{
                    fontSize: `${fontPreset}px`,
                    margin: "0 8px",
                    color: `${
                      fontPreset === delegate.fontSize ? "#00d1b2" : "black"
                    }`,
                  }}
                  onClick={() => {
                    delegate.pickedFontSize(fontPreset);
                  }}
                >
                  Aa
                </button>
              </Column>
            ))}
          </Columns>
        </div>
      </div>
    </div>
  );
};

export default FontSizePicker;
