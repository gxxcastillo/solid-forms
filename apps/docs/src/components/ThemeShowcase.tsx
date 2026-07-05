import { For, type JSX, Show, createSignal, onCleanup, onMount } from 'solid-js';

import {
  CheckboxField,
  InputField,
  PasswordField,
  SubmitButton,
  TextAreaField,
  useForm
} from '@gxxc/solid-forms';

import { FormStateInspector } from './FormStateInspector';
import styles from './ThemeShowcase.module.css';

interface SignupValues {
  [key: string]: string | boolean;
  email: string;
  username: string;
  password: string;
  confirm: string;
  bio: string;
  terms: boolean;
}

interface LoginValues {
  [key: string]: string;
  email: string;
  password: string;
  message: string;
}

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

function MailIcon(): JSX.Element {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' aria-hidden='true'>
      <rect x='3' y='5' width='18' height='14' rx='2' />
      <path d='m3 7 9 6 9-6' />
    </svg>
  );
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
            <signupForm.Form onSubmit={onSignupSubmit}>
              <InputField
                name='email'
                label='Email'
                leadingIcon={<MailIcon />}
                showLabel={() => true}
                required
              />
              <InputField name='username' label='Username' required minLength={3} />
              <PasswordField name='password' label='Password' required minLength={8} />
              <PasswordField name='confirm' label='Confirm password' required match='password' />
              <TextAreaField name='bio' label='Short bio' title='About you' />
              <CheckboxField name='terms' label='I accept the terms of service' required />
              <div class={styles.buttonRow}>
                <SubmitButton>Sign up</SubmitButton>
                <SubmitButton variant='approve' isDisabled={false}>
                  Save draft
                </SubmitButton>
              </div>
            </signupForm.Form>
          </div>

          <FormStateInspector title='Signup form state' state={signupForm.state} />
        </div>
      </Show>

      <Show when={section() === 'login'}>
        <div class={styles.layout}>
          <div class={styles.card}>
            <h2 class={styles.cardTitle}>Log in</h2>
            <loginForm.Form onSubmit={onLoginSubmit}>
              <InputField name='email' label='Email' required />
              <PasswordField name='password' label='Password' required minLength={8} />
              <TextAreaField name='message' label='Care to send a message?' />
              <SubmitButton />
            </loginForm.Form>
          </div>

          <FormStateInspector title='Login form state' state={loginForm.state} />
        </div>
      </Show>
    </section>
  );
}

export default ThemeShowcase;
