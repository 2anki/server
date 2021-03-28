import { useState } from "react";
import StyledMessageBox from "./StyledMessageBox";

const UploadForm = () => {
  const notificationKey = "show-notification";
  const [showNotification, setShowNotification] = useState(
    localStorage.getItem(notificationKey) !== "false"
  );

  return (
    <form encType="multipart/form-data" method="post">
      {/* Until we have onboarding, give new users some basic info */}
      {showNotification ? (
        <StyledMessageBox>
          <button
            className="delete"
            aria-label="close"
            onClick={() => {
              setShowNotification(false);
              window.localStorage.setItem(notificationKey, "false");
            }}
          />
          <p>
            We only support{" "}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7"
            >
              HTML
            </a>{" "}
            uploads from Notion.
          </p>
          <p>
            For tutorials checkout the official{" "}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd"
            >
              playlist
            </a>
          </p>
          <p style={{ fontWeight: "bold" }}>
            {" "}
            This project is 100% free and will remain free ✌️{" "}
            <span style={{ color: "grey", fontWeight: "normal" }}>
              #stillfree
            </span>
          </p>
        </StyledMessageBox>
      ) : null}
      <div className="field">
        <div className="file is-centered is-boxed is-success has-name is-large">
          <div className="field">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                name="pakker"
                accept=".zip,.html,.md"
                required
                multiple={true}
              />
              <span className="file-cta">
                <span className="file-label">Click to Upload...</span>
              </span>
              <span className="file-name">My Notion Export.zip</span>
            </label>
            <button
              style={{ marginTop: "2rem" }}
              className="button cta is-large is-primary"
              type="submit"
              disabled={false}
            >
              Convert
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UploadForm;
