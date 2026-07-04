import { StartServer, createHandler } from '@solidjs/start/server';

// Prerendering runs in this same build, so VITE_BASE_PATH (set in CI for
// GitHub Pages) is available here to prefix root-absolute asset paths.
const basePath = (import.meta.env.VITE_BASE_PATH ?? '/').replace(/\/$/, '');

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang='en'>
        <head>
          <meta charset='utf-8' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='icon' href={`${basePath}/favicon.ico`} />
          {assets}
        </head>
        <body>
          <div id='app'>{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
