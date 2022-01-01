import { useState } from "react";
import styled from "styled-components";
import Backend from "../../lib/Backend";
import SettingsModal from "../modals/SettingsModal";
import SliceRules from "./SliceRules";

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

let backend = new Backend();
const SearchObjectEntry = ({ title, icon, url, id, type }) => {
  const [isSettings, setShowSettings] = useState(false);
  const [showSlicer, setShowSlicer] = useState(false);

  return (
    <>
      <Entry>
        <ObjectMeta>
          <div className="control">
            <div className="tags has-addons">
              <span className="tag">Type</span>
              <span className="tag is-link">{type}</span>
            </div>
          </div>
          <span>{icon}</span>
          <span className="subtitle is-6">{title}</span>
        </ObjectMeta>
        <ObjectActions>
          <div onClick={() => setShowSlicer(!showSlicer)}>
            <img src="/icons/slicer.svg" width="32px" alt="slice" />
          </div>
          <ObjectAction
            url={url}
            image="/icons/Anki_app_logo.png"
            onClick={(event) => {
              event.preventDefault();
              backend.convert(id, type).then((res) => {
                window.location.href = "/uploads";
              });
            }}
          />
          <ObjectAction
            url={url}
            image="/icons/Notion_app_logo.png"
            onClick={() => {}}
          />
          <ObjectAction
            onClick={(event) => {
              event.preventDefault();
              setShowSettings(true);
            }}
            url={`/search/${id}/settings`}
            image="/icons/settings.svg"
          />
        </ObjectActions>
      </Entry>
      {showSlicer && (
        <SliceRules id={id} setDone={() => setShowSlicer(false)} />
      )}
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
