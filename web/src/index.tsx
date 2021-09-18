import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "bulma/css/bulma.css";
import styled from "styled-components";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

import App from "./App";

const StyledLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
`;
const LoadingScreen = () => {
  return <StyledLoader>Loading... </StyledLoader>;
};

Sentry.init({
  dsn: "https://d7943c67af2f4e82b9eece16f1eb842b@o404766.ingest.sentry.io/5965051",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);
