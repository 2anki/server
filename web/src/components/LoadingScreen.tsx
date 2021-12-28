import styled from "styled-components";

const StyledLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
`;
const LoadingScreen = () => {
  return <StyledLoader>Loading... </StyledLoader>;
};

export default LoadingScreen;
