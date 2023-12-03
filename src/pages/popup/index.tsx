import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import Popup from '@pages/popup/Popup';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { attachTwindStyle } from '@src/shared/style/twind';
import * as Sentry from '@sentry/react';

refreshOnUpdate('pages/popup');

Sentry.init({
  dsn: 'https://1e9f393e6a3adc2fe5950e5c26db1de4@o4505126429458432.ingest.sentry.io/4506277207867392',
  integrations: [
    // eslint-disable-next-line import/namespace
    new Sentry.BrowserTracing(),
    // eslint-disable-next-line import/namespace
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  attachTwindStyle(appContainer, document);
  const root = createRoot(appContainer);
  root.render(<Popup />);
}

init();
