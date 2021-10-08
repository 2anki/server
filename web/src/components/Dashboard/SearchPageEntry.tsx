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
`;
const SearchPageEntry = ({ title, icon }) => {
  return (
    <Entry>
      <span>{icon}</span>
      <span>{title}</span>
    </Entry>
  );
};

export default SearchPageEntry;
