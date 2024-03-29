import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import Popup from '@pages/popup/Popup';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { attachTwindStyle } from '@src/shared/style/twind';
import * as Sentry from '@sentry/react';

import packageJson from '../../../package.json';

refreshOnUpdate('pages/popup');

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://1e9f393e6a3adc2fe5950e5c26db1de4@o4505126429458432.ingest.sentry.io/4506277207867392',
    release: packageJson.version,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // eslint-disable-next-line import/namespace
    integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  });
}

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
