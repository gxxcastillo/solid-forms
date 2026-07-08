import { render } from 'solid-js/web';

import '@gxxc/solid-forms/styles.css';
import '@gxxc/solid-forms/themes/minimal.css';
import '@gxxc/solid-forms/themes/midnight.css';
import '@gxxc/solid-forms/themes/neobrutalist.css';

import App from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root was not found.');
}

render(() => <App />, root);
