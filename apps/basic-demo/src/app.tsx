import { MetaProvider, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';

import './app.css';

// Deployed under a subpath on GitHub Pages (see VITE_BASE_PATH in app.config.ts);
// the VITE_ prefix makes it available in the browser bundle via import.meta.env.
const basePath = (import.meta.env.VITE_BASE_PATH ?? '/').replace(/\/$/, '');

export default function App() {
  return (
    <Router
      base={basePath}
      root={(props) => (
        <MetaProvider>
          <Title>Solid Forms - Demo</Title>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
