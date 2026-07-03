import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { createRoot } from 'solid-js';
import { FormContextProvider, createFormStore } from '@gxxc/solid-forms-state';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BaseForm } from './BaseForm';

type TestForm = { [key: string]: string; email: string };

function makeStore() {
  return createRoot((d) => {
    const store = createFormStore<TestForm>();
    return { store, dispose: d };
  });
}

describe('BaseForm (rendered)', () => {
  afterEach(cleanup);

  it('calls onSubmit with serialized field values when the form is valid', () => {
    const { store } = makeStore();
    const [, mutations] = store;
    mutations.initializeField('email', 'a@b.com', []);
    const onSubmit = vi.fn();

    render(() => (
      <FormContextProvider store={store}>
        <BaseForm onSubmit={onSubmit}>
          <button type='submit'>Submit</button>
        </BaseForm>
      </FormContextProvider>
    ));

    fireEvent.click(screen.getByRole('button'));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com' }, '');
  });

  it('blocks submit and marks fields blurred when the form is invalid', () => {
    const { store } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('email', '', ['Required']);
    const onSubmit = vi.fn();

    render(() => (
      <FormContextProvider store={store}>
        <BaseForm onSubmit={onSubmit}>
          <button type='submit'>Submit</button>
        </BaseForm>
      </FormContextProvider>
    ));

    fireEvent.click(screen.getByRole('button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(state.hasFieldBlurred('email')).toBe(true);
  });

  it('surfaces a rejected onSubmit into form.state.errors', async () => {
    const { store } = makeStore();
    const [state, mutations] = store;
    mutations.initializeField('email', 'a@b.com', []);
    const onSubmit = vi.fn().mockRejectedValue(new Error('Invalid credentials'));

    render(() => (
      <FormContextProvider store={store}>
        <BaseForm onSubmit={onSubmit}>
          <button type='submit'>Submit</button>
        </BaseForm>
      </FormContextProvider>
    ));

    fireEvent.click(screen.getByRole('button'));

    await vi.waitFor(() => expect(state.errors).toEqual(['Invalid credentials']));
    expect(state.isProcessing).toBe(false);
  });
});
