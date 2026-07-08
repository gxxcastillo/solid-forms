import { Match, Switch } from 'solid-js';

import { LoginForm, SignupForm } from '@gxxc/solid-forms-examples';

import './App.css';
import { resolveFixtureRoute } from './routes';

export function App() {
  const route = resolveFixtureRoute(window.location.pathname);

  return (
    <main class='fixture' data-sf-theme={route.theme}>
      <div class='fixture__inner'>
        <header class='fixture__header'>
          <p class='fixture__eyebrow'>{route.theme} theme</p>
          <h1 class='fixture__title'>{route.heading}</h1>
        </header>

        <section class='fixture__form' aria-labelledby='fixture-form-title'>
          <h2 class='fixture__formTitle' id='fixture-form-title'>
            {route.form === 'signup' ? 'Create your account' : 'Log in'}
          </h2>

          <Switch>
            <Match when={route.form === 'signup'}>
              <SignupForm actionsClass='fixture__actions' />
            </Match>
            <Match when={route.form === 'login'}>
              <LoginForm />
            </Match>
          </Switch>
        </section>
      </div>
    </main>
  );
}

export default App;
