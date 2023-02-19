import styled from 'styled-components';
import PrimaryButton from '../../../../../components/buttons/PrimaryButton';

import PersonIllustration from '../../../../../components/illustrations/PersonIllustration';

export const NewsIcon = styled(PersonIllustration)`
  position: absolute;
  right: 0;
  width: 150.03px;
  height: 138.7px;
  top: -120px;
  @media (max-width: 1024px) {
    /* margin-top: 4rem; */
    width: 97px;
    height: 90px;
  }
`;

export const Centered = styled.div`
  display: flex;
  justify-content: center;
`;

export const ReadMoreNews = styled(PrimaryButton)``;
