import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/popup/index.css';
import Popup from '@pages/popup/Popup';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { attachTwindStyle } from '@src/shared/style/twind';
// import * as Sentry from '@sentry/react';

refreshOnUpdate('pages/popup');

// Sentry.init({
//   dsn: import.meta.env.VITE_SENTRY_DSN,
//   integrations: [
//     // eslint-disable-next-line import/namespace
//     new Sentry.BrowserTracing({
//       // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
//       tracePropagationTargets: ['localhost', /^https:\/\/vkuprin\.com\/api/],
//     }),
//     // eslint-disable-next-line import/namespace
//     new Sentry.Replay(),
//   ],
//   // Performance Monitoring
//   tracesSampleRate: 1.0, // Capture 100% of the transactions
//   // Session Replay
//   replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
// });

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
