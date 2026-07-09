import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';

import { FormContextProvider, useForm } from '@gxxc/solid-forms';
import { LoginForm, type LoginValues, SignupForm, type SignupValues } from '@gxxc/solid-forms-examples';

import { FormStateInspector } from './FormStateInspector';
import styles from './ThemeShowcase.module.css';

const THEMES = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'neobrutalist', label: 'Neobrutalist' }
] as const;

const SECTIONS = [
  { id: 'signup', label: 'Signup' },
  { id: 'login', label: 'Login' }
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

function sectionFromHash(hash: string): SectionId | undefined {
  const id = hash.replace(/^#/, '');
  return SECTIONS.find((s) => s.id === id)?.id;
}

export function ThemeShowcase() {
  const [theme, setTheme] = createSignal<(typeof THEMES)[number]['id']>('minimal');
  const [section, setSection] = createSignal<SectionId>('signup');

  const signupForm = useForm<SignupValues, void>();
  const loginForm = useForm<LoginValues, void>();

  function onSignupSubmit() {
    // The live state inspector is the visible feedback for this demo.
  }

  function onLoginSubmit() {
    // The live state inspector is the visible feedback for this demo.
  }

  onMount(() => {
    const fromHash = sectionFromHash(window.location.hash);
    if (fromHash) setSection(fromHash);

    const onHashChange = () => {
      setSection(sectionFromHash(window.location.hash) ?? SECTIONS[0].id);
    };
    window.addEventListener('hashchange', onHashChange);
    onCleanup(() => window.removeEventListener('hashchange', onHashChange));
  });

  function selectSection(id: SectionId) {
    setSection(id);
    window.location.hash = id;
  }

  return (
    <section class={`${styles.showcase} not-content`} data-sf-theme={theme()}>
      <div class={styles.switcher} role='group' aria-label='Theme'>
        <For each={THEMES}>
          {(t) => (
            <button
              type='button'
              class={theme() === t.id ? `${styles.switchBtn} ${styles.switchBtnActive}` : styles.switchBtn}
              aria-pressed={theme() === t.id}
              onClick={() => setTheme(t.id)}
            >
              {t.label}
            </button>
          )}
        </For>
      </div>

      <div class={styles.tabs} role='group' aria-label='Demo'>
        <For each={SECTIONS}>
          {(s) => (
            <button
              type='button'
              class={section() === s.id ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
              aria-pressed={section() === s.id}
              onClick={() => selectSection(s.id)}
            >
              {s.label}
            </button>
          )}
        </For>
      </div>

      <Show when={section() === 'signup'}>
        <div class={styles.layout}>
          <div class={styles.card}>
            <h2 class={styles.cardTitle}>Create your account</h2>
            <FormContextProvider store={signupForm.store}>
              <SignupForm onSubmit={onSignupSubmit} actionsClass={styles.buttonRow} />
            </FormContextProvider>
          </div>

          <FormStateInspector title='Signup form state' state={signupForm.state} />
        </div>
      </Show>

      <Show when={section() === 'login'}>
        <div class={styles.layout}>
          <div class={styles.card}>
            <h2 class={styles.cardTitle}>Log in</h2>
            <FormContextProvider store={loginForm.store}>
              <LoginForm onSubmit={onLoginSubmit} />
            </FormContextProvider>
          </div>

          <FormStateInspector title='Login form state' state={loginForm.state} />
        </div>
      </Show>
    </section>
  );
}

export default ThemeShowcase;
