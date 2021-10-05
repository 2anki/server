import styled from "styled-components";

const Entry = styled.div`
  display: flex;
  align-items: center;
  :hover {
    background: lightgray;
  }
  padding: 1rem;
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
