import { useState } from "react";
import styled from "styled-components";
import SettingsModal from "../modals/SettingsModal";

const Entry = styled.div`
  display: flex;
  align-items: center;
  grid-gap: 1.2rem;
  padding: 1rem;
  font-size: 2.4vw;
  justify-content: space-between;
`;

const ObjectMeta = styled.div`
  align-items: center;
  display: flex;
  grid-gap: 1.2rem;
`;

const ObjectAction = ({ url, image, onClick }) => {
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={onClick}>
      <img alt="Page action" width="32px" src={image}></img>
    </a>
  );
};

const ObjectActions = styled.div`
  display: flex;
  grid-gap: 1rem;
  min-width: 80px;
`;

const SlicerRules = ({ setDone }) => {
  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">
          Slicer - Override the default parser and define what a flashcard is
        </p>
      </header>
      <div className="card-content">
        <ul className="flex is-align-items-center">
          <li className="flex is-align-items-center">
            <span className="mx-1">Decks are: </span>
            <div className="select">
              <select>
                <option>Pages</option>
                <option>Databases</option>
                <option>Headings</option>
              </select>
            </div>
          </li>
          <li className="my-2 flex is-align-items-center">
            <span className="mx-1">Flashcards are: </span>
            <div className="select">
              <select>
                <option>Toggles</option>
                <option>Bulletpoints</option>
                <option>Numbered lists</option>
              </select>
            </div>
          </li>
        </ul>
      </div>
      <footer className="card-footer">
        <a href="#" className="card-footer-item">
          Save
        </a>
        <a href="#" className="card-footer-item" onClick={() => setDone()}>
          Cancel
        </a>
      </footer>
    </div>
  );
};

const SearchObjectEntry = ({ title, icon, url, id }) => {
  const [isSettings, setShowSettings] = useState(false);
  const [hover, setHover] = useState(false);
  const [showSlicer, setShowSlicer] = useState(false);

  return (
    <>
      <Entry>
        <ObjectMeta>
          <span>{icon}</span>
          <span>{title}</span>
        </ObjectMeta>
        <ObjectActions>
          <div
            style={{ border: showSlicer ? "3px solid #5397f5" : "none" }}
            onMouseEnter={() => setShowSlicer(true)}
            // onMouseLeave={() => setShowSlicer(false)}
          >
            <img src="/icons/slicer.svg" width="32px" alt="slice" />
          </div>
          <ObjectAction
            url={`/notion/${id}/convert`}
            image="/icons/Anki_app_logo.png"
            onClick={() => console.log("clicked APKG")}
          />
          {!hover && (
            <div
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              <img width="32px" src="/icons/ellipsis.svg" alt="more" />
            </div>
          )}
          {hover && (
            <>
              <ObjectAction
                url={url}
                image="/icons/Notion_app_logo.png"
                onClick={() => console.log("clicked Notion")}
              />
              <ObjectAction
                onClick={(event) => {
                  event.preventDefault();
                  setShowSettings(true);
                }}
                url={`/dashboard/${id}/settings`}
                image="/icons/settings.svg"
              />
            </>
          )}
        </ObjectActions>
      </Entry>
      {showSlicer && <SlicerRules setDone={() => setShowSlicer(false)} />}
      {/* TODO: Detect if this page is a official 2anki.net template duplicate then link directly to the page section with the settings */}
      <SettingsModal
        pageId={id}
        pageTitle={title}
        isActive={isSettings}
        onClickClose={() => {
          setShowSettings(false);
        }}
      />
    </>
  );
};

export default SearchObjectEntry;
