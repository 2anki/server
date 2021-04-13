import { Link, useLocation } from "react-router-dom";
import WarningMessage from "../components/WarningMessage";
import UploadForm from "../components/UploadForm";
import Settings from "../components/Settings";
import { useContext, useEffect, useState } from "react";

import StoreContext from "../store/StoreContext";

import SettingsIcon from "../components/icons/SettingsIcon";
import { Message, Column, Columns } from "trunx";

import SUPPORTERS from "../Supporters";

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

  const store = useContext(StoreContext);
  const [imageHover, setImageHover] = useState("");

  // Make sure the defaults are set if not present to ensure backwards compatability
  useEffect(() => {
    store.loadDefaults();
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
        {isSettings ? <Settings /> : null}
      </div>
      <Message style={{ maxWidth: "480px", margin: "1rem auto" }} isInfo>
        <Message.Header>Thank you to my patrons!</Message.Header>
        <Message.Body>
          <Columns>
            {SUPPORTERS.map((patreon) => (
              <Column>
                <figure className="image is-32x32">
                  <img
                    loading="lazy"
                    className="is-rounded"
                    alt={`${patreon.name} avatar`}
                    src={patreon.link}
                    onMouseEnter={() => setImageHover(patreon.name)}
                    onMouseLeave={() => setImageHover("")}
                  ></img>
                  {imageHover === patreon.name && (
                    <span className="tag is-black">{patreon.name}</span>
                  )}
                </figure>
              </Column>
            ))}
          </Columns>
          <p>
            {" "}
            Due to privacy only{" "}
            <a href="https://patreon.com/alemayhu">patrons</a> who have
            requested it or{" "}
            <a href="https://github.com/sponsors/alemayhu">GitHub sponsors</a>{" "}
            will be displayed above. This is to respect their privacy.
          </p>
        </Message.Body>
      </Message>
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
