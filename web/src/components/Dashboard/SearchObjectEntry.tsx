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
const SearchObjectEntry = ({ title, icon, url, id }) => {
  const [isSettings, setShowSettings] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <>
      <Entry>
        <ObjectMeta>
          <span>{icon}</span>
          <span>{title}</span>
        </ObjectMeta>
        <ObjectActions>
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
