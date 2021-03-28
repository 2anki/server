import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";

import WarningMessage from "../components/WarningMessage";
import StyledMessageBox from "../components/StyledMessageBox";
import ErrorMessage from "../components/ErrorMessage";
import UploadForm from "../components/UploadForm";

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
        <UploadForm />
      </div>
    </div>
  );
};

export default UploadPage;
