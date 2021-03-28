import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";

import WarningMessage from "../components/WarningMessage";
import StyledMessageBox from "../components/StyledMessageBox";
import ErrorMessage from "../components/ErrorMessage";

// A custom hook that builds on useLocation to parse
// the query string for you.
// Reference: https://reactrouter.com/web/example/query-parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const UploadPage = () => {
  const isDevelopment = window.location.host !== "2anki.net";
  const query = useQuery();
  const view = query.get("view");
  const errorMessage = "";
  const notificationKey = "show-notification";
  const [showNotification, setShowNotification] = useState(
    localStorage.getItem(notificationKey) !== "false"
  );

  return (
    <div style={{ paddingTop: "4rem" }}>
      {isDevelopment ? <WarningMessage /> : null}
      <div className="tabs is-centered is-boxed">
        <ul>
          <li className={`${view === "upload" ? "is-active" : null}`}>
            {" "}
            <Link to="upload?view=upload">Upload</Link>
          </li>
          <li className={`${view === "template" ? "is-active" : null}`}>
            <Link to="upload?view=template">Template</Link>
          </li>
          <li className={`${view === "deck-options" ? "is-active" : null}`}>
            <Link to="upload?view=deck-options">Deck</Link>
          </li>
          <li className={`${view === "card-options" ? "is-active" : null}`}>
            <Link to="upload?view=card-options">Card</Link>
          </li>
        </ul>
      </div>
      <div className="container">
        <div className="has-text-centered">
          <h2 className="title">Notion to Anki</h2>
        </div>
        {errorMessage ? <ErrorMessage msg={errorMessage} /> : null}
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
      </div>
    </div>
  );
};

export default UploadPage;
