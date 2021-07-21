import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "bulma/css/bulma.css";
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

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);
