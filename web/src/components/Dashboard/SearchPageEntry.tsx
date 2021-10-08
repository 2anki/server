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

const PageMeta = styled.div`
  align-items: center;
  display: flex;
  grid-gap: 1.2rem;
`;

const PageActions = styled.div``;
const SearchPageEntry = ({ title, icon, url }) => {
  const [hover, setHover] = useState(true);
  return (
    <Entry
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <PageMeta>
        <span>{icon}</span>
        <span>{title}</span>
      </PageMeta>
      {hover && (
        <PageActions>
          <a href={url} target="_blank">
            <img src="/icons/Notion_app_logo.png"></img>
          </a>
        </PageActions>
      )}
    </Entry>
  );
};

export default SearchPageEntry;
