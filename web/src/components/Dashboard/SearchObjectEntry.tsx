import { useState } from "react";
import styled from "styled-components";
import useQuery from "../../lib/hooks/useQuery";
import SettingsModal from "../modals/SettingsModal";

const Entry = styled.div`
  display: flex;
  align-items: center;
  :hover {
    background: lightgray;
  }
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
  const query = useQuery();
  const view = query.get("view");
  const [isSettings, setShowSettings] = useState(
    view === "template" || view === "deck-options" || view === "card-options"
  );
  const [hover, setHover] = useState(false);
  return (
    <>
      <Entry
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <ObjectMeta>
          <span>{icon}</span>
          <span>{title}</span>
        </ObjectMeta>
        {hover && (
          <ObjectActions>
            <ObjectAction
              url={url}
              image="/icons/Notion_app_logo.png"
              onClick={() => console.log("clicked Notion")}
            />
            <ObjectAction
              url={`/notion/${id}/convert`}
              image="/icons/Anki_app_logo.png"
              onClick={() => console.log("clicked APKG")}
            />
            <ObjectAction
              onClick={(event) => {
                event.preventDefault();
                setShowSettings(true);
              }}
              url={`/dashboard/${id}/settings`}
              image="/icons/settings.svg"
            />
          </ObjectActions>
        )}
      </Entry>
      <SettingsModal
        pageId={id}
        pageTitle={title}
        isActive={isSettings}
        onClickClose={() => {
          window.history.pushState({}, "", "upload");
          setShowSettings(false);
        }}
      />
    </>
  );
};

export default SearchObjectEntry;
