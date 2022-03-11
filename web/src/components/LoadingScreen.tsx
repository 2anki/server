import styled from 'styled-components';

const StyledLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  height: 100vh;
  width: 60vw;
  margin: 0 auto;
`;
function LoadingScreen() {
  return (
    <StyledLoader>
      <progress className="progress is-large is-info" max="100">
        60%
      </progress>
    </StyledLoader>
  );
}

export default LoadingScreen;
