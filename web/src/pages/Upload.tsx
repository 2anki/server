import { Link, useLocation } from "react-router-dom";
import WarningMessage from "../components/WarningMessage";
import UploadForm from "../components/UploadForm";
import Settings from "../components/Settings";
import { useEffect, useMemo } from "react";

import CardOptionsStore from "../store/Options";

import SettingsIcon from "../components/icons/SettingsIcon";

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

  const isUpload = view === "upload" || !view;
  const isSettings =
    view === "template" || view === "deck-options" || view === "card-options";

  const store = useMemo(() => new CardOptionsStore(), []);

  // Make sure the defaults are set if not present to ensure backwards compatability
  useEffect(() => {
    for (const option of store.options) {
      const value = localStorage.getItem(option.key);
      if (value === null) {
        localStorage.setItem(option.key, option.default.toString());
      }
    }
  }, [store]);

  return (
    <div style={{ paddingTop: "4rem" }}>
      {isDevelopment ? <WarningMessage /> : null}
      <div className="tabs is-centered">
        <ul>
          <li className={`${isUpload ? "is-active" : null}`}>
            <Link to="upload?view=upload">Upload</Link>
          </li>
          <li className={`${isSettings ? "is-active" : null}`}>
            <Link to="upload?view=template">
              <SettingsIcon />
              Settings
            </Link>
          </li>
        </ul>
      </div>
      <div className="container">
        {isUpload ? <UploadForm /> : null}
        {isSettings ? <Settings store={store} /> : null}
      </div>
      <div className="has-text-centered">
        <hr />
        <h3 className="title is-3">
          Video Tutorial: Read Faster, Remember More
        </h3>
        <p className="subtitle">
          Incremental Reading with Anki, Notion and notion2anki
        </p>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/4PdhlNbBqXo"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
        ></iframe>
      </div>
    </div>
  );
};

export default UploadPage;
