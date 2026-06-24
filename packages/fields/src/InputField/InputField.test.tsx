import { cleanup, render, screen } from '@solidjs/testing-library';
import { createRoot } from 'solid-js';
import { FormContextProvider, createFormStore } from '@gxxc/solid-forms-state';
import { afterEach, describe, expect, it } from 'vitest';

import { InputField } from './InputField';

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
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(input).toHaveAttribute('aria-describedby', 'username-errors');
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
});
