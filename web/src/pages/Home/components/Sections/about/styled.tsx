import styled from 'styled-components';

export const Text = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
`;

export const Mascot = styled.div`
  margin: 0 auto;
  width: 485px;

  img {
    object-fit: contain;
  }

  @media (max-width: 1024px) {
    width: 186px;
  }
`;
