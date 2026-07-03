import { For, type JSX, createSignal } from 'solid-js';

import {
  CheckboxField,
  InputField,
  PasswordField,
  SubmitButton,
  TextAreaField,
  useForm
} from '@gxxc/solid-forms';

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

const THEMES = [
  { id: '', label: 'Default' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'neobrutalist', label: 'Neobrutalist' }
] as const;

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
  const form = useForm<SignupValues, void>();

  function onSubmit(values: SignupValues) {
     
    console.log('signup submitted', values);
  }

  const activeLabel = () => THEMES.find((t) => t.id === theme())?.label ?? 'Default';

  return (
    <div class={styles.page} data-sf-theme={theme() || undefined}>
      <div class={styles.inner}>
        <h1 class={styles.heading}>solid-forms theming</h1>
        <p class={styles.sub}>
          The same markup, re-skinned entirely through CSS custom properties. Active theme:{' '}
          <span class={styles.themeName}>{activeLabel()}</span>
        </p>

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

        <div class={styles.card}>
          <h2 class={styles.cardTitle}>Create your account</h2>
          <form.Form onSubmit={onSubmit}>
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
            <CheckboxField name='terms' label='I accept the terms of service' />
            <div class={styles.buttonRow}>
              <SubmitButton>Sign up</SubmitButton>
              <SubmitButton variant='approve' isDisabled={false}>
                Save draft
              </SubmitButton>
            </div>
          </form.Form>
        </div>
      </div>
    </div>
  );
}

export default ThemeShowcase;
