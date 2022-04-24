import styled from 'styled-components';

export const Container = styled.div`
  display: block;
  flex: 1 0 auto;
  padding: 32px 64px;
  @media (max-width: 1024px) {
    padding: 0;
  }
`;

export const Main = styled.main`
  max-width: 720px;
  margin: 0 auto;
`;

export const HomeContainer = styled(Container)`
padding: 0;
`;

export const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 11.25rem 1fr 11.25rem;
  padding: 2rem;
  grid-gap: 1rem;
`;
