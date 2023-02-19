import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import 'bulma/css/bulma.css';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import App from './App';

import LoadingIndicator from './components/Loading';

if (!process.env.REACT_SKIP_SENTRY) {
  Sentry.init({
    dsn: 'https://962b127355704482be99c300f58d00f6@o1284472.ingest.sentry.io/6596166',
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingIndicator />}>
      <App />
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);
