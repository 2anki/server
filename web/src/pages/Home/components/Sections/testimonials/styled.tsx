import styled from 'styled-components';

import PersonIllustration from '../../../../../components/illustrations/PersonIllustration';

export const Illustration4 = styled(PersonIllustration)`
position: absolute;
top: -380px;
right: 0;
width: 152px;
height: 341px;

@media (max-width: 1024px) {
  margin-top: 4rem;
  width: 146px;
  height: 328px;
  /* top: -320px; */
}
`;

export const Curve = styled.div`
background-color: #ebeced;
width: 100vw;
height: 150px;
border-top-left-radius: 50%;
border-top-right-radius: 50%;
`;

export const Testimonials = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
