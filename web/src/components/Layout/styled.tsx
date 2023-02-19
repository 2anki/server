import styled from 'styled-components';

export const Layout = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const PageSidebar = styled.div.attrs({ className: 'is-hidden-touch' })`
  flex-basis: 20rem;
  flex-grow: 1;
  height: 70vh;
  position: sticky;
  top: 0;
`;
export const PageContent = styled.div`
  flex-basis: 0;
  flex-grow: 999;
`;

export const PageHeader = styled.div.attrs({ className: 'is-hidden-desktop' })`
  width: 100%;
`;