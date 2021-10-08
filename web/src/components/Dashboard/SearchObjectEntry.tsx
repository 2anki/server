import { useState } from "react";
import styled from "styled-components";

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

const ObjectAction = ({ url, image }) => {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img width="32px" src={image}></img>
    </a>
  );
};

const ObjectActions = styled.div`
  display: flex;
  grid-gap: 1rem;
  min-width: 80px;
`;
const SearchObjectEntry = ({ title, icon, url, id }) => {
  const [hover, setHover] = useState(false);
  return (
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
          <ObjectAction url={url} image="/icons/Notion_app_logo.png" />
          <ObjectAction
            url={`/notion/${id}/convert`}
            image="/icons/Anki_app_logo.png"
          />
        </ObjectActions>
      )}
    </Entry>
  );
};

export default SearchObjectEntry;
