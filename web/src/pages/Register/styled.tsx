import styled from 'styled-components';

export const StyledPage = styled.div`
  background: #5397f5;
  position: absolute;
  top: 0;
  left: 0;
  color: white;
  width: 100vw;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h2 {
    font-weight: bold;
    text-transform: uppercase;
  }
  h1 {
    font-weight: bold;
  }
`;
export const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
`;

export const Card = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: white;
  max-width: 256px;
  max-height: 256px;
  color: black;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h2 {
    font-weight: bold;
  }
  h3 {
    font-weight: bold;
  }
`;

export const PricingPlans = styled.div`
  display: flex;
  justify-content: center;
`;

export const SelectButton = styled.div`
  background: rgb(58, 160, 218);
  border: 1px solid rgb(48, 139, 191);
  font-weight: bold;
  border-radius: 0.2rem;
  margin-top: 0.5rem;
  display: inline-block;
  a {
    color: white;
    padding: 0.3rem 0.5rem;
  }
`;
