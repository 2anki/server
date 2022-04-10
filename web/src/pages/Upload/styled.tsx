import styled from 'styled-components';

import { Container } from '../../components/styled';

export const FlexColumn = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const InfoMessage = styled.p`
  font-size: 11px;
  margin: 0 auto;
  max-width: 480px;
  color: grey;
  padding-top: 1rem;
`;

export const ImportTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;

export const SettingsLink = styled.div`
  display: flex;
  align-items: center;
  justify-items: center;
  .link {
    display: flex;
    color: grey;
  }
`;

export const Main = styled.main`
  max-width: 768px;
  margin: 0 auto;
`;

export const UploadContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content:center;
`;
