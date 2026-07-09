import { cleanup, render, screen } from '@solidjs/testing-library';
import { Show, createRoot, createSignal } from 'solid-js';
import { afterEach, describe, expect, it } from 'vitest';

import { FormContextProvider, createFormStore } from '@gxxc/solid-forms-state';

import { InputField } from './InputField';
import styles from './InputField.module.css';

type TestForm = { [key: string]: string; username: string; email: string };

function makeStore() {
  return createRoot((d) => {
    const store = createFormStore<TestForm>();
    return { store, dispose: d };
  });
}

describe('InputField', () => {
  afterEach(cleanup);

  it('renders an input with id matching the field name', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <InputField<TestForm, 'username'> name='username' label='Username' />
      </FormContextProvider>
    ));
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'username');
  });

  it('associates the default placeholder-style input with its label', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <InputField<TestForm, 'username'> name='username' label='Username' />
      </FormContextProvider>
    ));

    const input = screen.getByLabelText('Username');
    const label = document.querySelector('label[for="username"]');

    expect(input).toHaveAttribute('placeholder', 'Username');
    expect(label).toHaveClass(styles.screenReaderOnly);
  });

  it('sets aria-invalid=false when there are no errors', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <InputField<TestForm, 'username'> name='username' label='Username' />
      </FormContextProvider>
    ));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('sets aria-invalid=true and shows error when errors are displayable', () => {
    const { store } = makeStore();
    const [, mutations] = store;
    // Initialize with a valid value so hasBeenValid=true, then set errors.
    // getDisplayableErrors returns errors only when hasBeenValid OR (hasBeenValid===undefined AND hasBeenBlurred).
    mutations.initializeField('username', 'alice', []);
    mutations.setFieldValue('username', '', ['Required']);

    render(() => (
      <FormContextProvider store={store}>
        <InputField<TestForm, 'username'> name='username' label='Username' required />
      </FormContextProvider>
    ));

    const input = screen.getByRole('textbox');
    const alert = screen.getByRole('alert');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(alert).toHaveTextContent('Required');
    // aria-describedby must reference the error element by its (unique) id.
    expect(alert.id).toBeTruthy();
    expect(input).toHaveAttribute('aria-describedby', alert.id);
  });

  it('renders label with for attribute matching the input id when showLabel returns true', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <InputField<TestForm, 'username'> name='username' label='Username' showLabel={() => true} />
      </FormContextProvider>
    ));
    const label = document.querySelector('label[for="username"]');
    expect(label).not.toBeNull();
  });

  it('reactively applies the floating-label state class once the field has a value', () => {
    const { store } = makeStore();
    const [, mutations] = store;
    const { container } = render(() => (
      <FormContextProvider store={store}>
        <InputField<TestForm, 'email'> name='email' label='Email' showLabel={() => true} />
      </FormContextProvider>
    ));

    const root = container.querySelector(`.${styles.InputField}`)!;
    expect(root.classList.contains(styles.withLabel)).toBe(true);
    expect(root.classList.contains(styles.hasValue)).toBe(false);

    // Updating the value must toggle the class — a static classList would not.
    mutations.setFieldValue('email', 'ada@example.com', []);
    expect(root.classList.contains(styles.hasValue)).toBe(true);
  });

  it('unregisters the field from form state on unmount', () => {
    const { store } = makeStore();
    const [state] = store;
    const [show, setShow] = createSignal(true);

    render(() => (
      <FormContextProvider store={store}>
        <Show when={show()}>
          <InputField<TestForm, 'username'> name='username' label='Username' required />
        </Show>
      </FormContextProvider>
    ));

    expect(state.getField('username')).toBeDefined();
    expect(state.isFormValid).toBe(false); // required + empty

    setShow(false);

    expect(state.getField('username')).toBeUndefined();
    expect(state.isFormValid).toBe(true);
  });
});
