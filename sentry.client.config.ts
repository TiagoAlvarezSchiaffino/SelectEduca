// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a1dc8cd72a62aacab0dd520eee207398@o4505687617175552.ingest.sentry.io/4505687622090752",

  integrations: [new Sentry.BrowserTracing()],

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: "production",

  tracePropagationTargets: ['localhost', /^\//],
});