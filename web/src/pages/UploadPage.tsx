import styled from "styled-components";
import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import StoreContext from "../store/StoreContext";
import WarningMessage from "../components/WarningMessage";
import UploadForm from "../components/UploadForm";
import SettingsIcon from "../components/icons/SettingsIcon";
import SettingsModal from "../components/modals/SettingsModal";

// A custom hook that builds on useLocation to parse
// the query string for you.
// Reference: https://reactrouter.com/web/example/query-parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Container = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding-top: 4rem;
`;

const UploadPage = () => {
  const isDevelopment = window.location.host !== "2anki.net";
  const query = useQuery();
  const view = query.get("view");

  const isUpload = view === "upload" || !view;
  const [isSettings, setShowSettings] = useState(
    view === "template" || view === "deck-options" || view === "card-options"
  );

  const store = useContext(StoreContext);

  // Make sure the defaults are set if not present to ensure backwards compatability
  useEffect(() => {
    store.loadDefaults();
  }, [store]);

  return (
    <Container>
      {isDevelopment ? <WarningMessage /> : null}
      <p className="my-2">
        2anki.net currently only supports
        <a
          rel="noreferrer"
          target="_blank"
          href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7"
        >
          {" "}
          HTML and ZIP exports from Notion
        </a>
        . All files are automatically deleted after 21 minutes. Checkout the{" "}
        <a rel="noreferrer" target="_blank" href="https://youtube.com/c/alexanderalemayhu?sub_confirmation=1">
          YouTube channel for tutorials
        </a>
        .
      </p>
      <div className="tabs is-centered">
        <ul>
          <li className={`${isUpload ? "is-active" : null}`}>
            <Link to="upload?view=upload">Upload</Link>
          </li>
          <li onClick={() => setShowSettings(true)}>
            <Link to="upload?view=template">
              <SettingsIcon />
              Settings
            </Link>
          </li>
        </ul>
      </div>
      <div className="container">
        <UploadForm />
        <SettingsModal
          isActive={isSettings}
          onClickClose={() => setShowSettings(false)}
        />
      </div>
    </Container>
  );
};

export default UploadPage;
