import { cleanup, render, screen } from '@solidjs/testing-library';
import { createRoot } from 'solid-js';
import { afterEach, describe, expect, it } from 'vitest';

import { FormContextProvider, createFormStore } from '@gxxc/solid-forms-state';

import { SubmitButton } from './SubmitButton';
import styles from './SubmitButton.module.css';

type TestForm = { [key: string]: string; email: string };

function makeStore(state?: Parameters<typeof createFormStore<TestForm>>[0]) {
  return createRoot((d) => {
    const store = createFormStore<TestForm>(state);
    return { store, dispose: d };
  });
}

describe('SubmitButton', () => {
  afterEach(cleanup);

  it('renders a real <button>, not an <input>', () => {
    const { store } = makeStore();
    const { container } = render(() => (
      <FormContextProvider store={store}>
        <SubmitButton>Log in</SubmitButton>
      </FormContextProvider>
    ));
    expect(container.querySelector('button')).not.toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  it('renders its children as the button label', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton>Log in</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByRole('button')).toHaveTextContent('Log in');
  });

  it('falls back to a default label when no children are given', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton />
      </FormContextProvider>
    ));
    expect(screen.getByRole('button')).toHaveTextContent('submit');
  });

  it('defaults to type="submit"', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton>Log in</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('renders type="button" when variant is "approve"', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton variant='approve'>Approve</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('disables the button when the form is invalid', () => {
    const { store } = makeStore();
    const [, mutations] = store;
    mutations.initializeField('email', '', ['Required']);

    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton>Log in</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables the button when the form is valid', () => {
    const { store } = makeStore();
    const [, mutations] = store;
    mutations.initializeField('email', 'a@b.com', []);

    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton>Log in</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('lets isDisabled override the computed validity check', () => {
    const { store } = makeStore();
    const [, mutations] = store;
    mutations.initializeField('email', 'a@b.com', []);

    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton isDisabled>Log in</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies the themeable button class', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton>Log in</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByRole('button').classList.contains(styles.button)).toBe(true);
  });

  it('adds the approve variant class only for variant="approve"', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton>Primary</SubmitButton>
        <SubmitButton variant='approve'>Secondary</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByText('Primary').classList.contains(styles.approve)).toBe(false);
    expect(screen.getByText('Secondary').classList.contains(styles.approve)).toBe(true);
  });

  it('adds the fullWidth class when isFullWidth is set', () => {
    const { store } = makeStore();
    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton isFullWidth>Wide</SubmitButton>
        <SubmitButton>Narrow</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByText('Wide').classList.contains(styles.fullWidth)).toBe(true);
    expect(screen.getByText('Narrow').classList.contains(styles.fullWidth)).toBe(false);
  });

  it('sets the name attribute for multi-button forms', () => {
    const { store } = makeStore();
    const [, mutations] = store;
    mutations.initializeField('email', 'a@b.com', []);

    render(() => (
      <FormContextProvider store={store}>
        <SubmitButton name='publish'>Publish</SubmitButton>
      </FormContextProvider>
    ));
    expect(screen.getByRole('button')).toHaveAttribute('name', 'publish');
  });
});
