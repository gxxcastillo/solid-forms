import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { createRoot } from 'solid-js';
import { FormContextProvider, createFormStore } from '@gxxc/solid-forms-state';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BaseForm } from './BaseForm';
import styles from './BaseForm.module.css';

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

  it('exposes the stable `sf-form` hook and left-aligns by default', () => {
    const { store } = makeStore();
    const { container } = render(() => (
      <FormContextProvider store={store}>
        <BaseForm onSubmit={vi.fn()}>
          <button type='submit'>Submit</button>
        </BaseForm>
      </FormContextProvider>
    ));

    const form = container.querySelector('form')!;
    expect(form.classList.contains('sf-form')).toBe(true);
    expect(form.classList.contains(styles.form)).toBe(true);
    expect(form.classList.contains(styles.alignLeft)).toBe(true);
    expect(form.classList.contains(styles.alignCenter)).toBe(false);
  });

  it('applies alignment, fullWidthButtons, and a custom className', () => {
    const { store } = makeStore();
    const { container } = render(() => (
      <FormContextProvider store={store}>
        <BaseForm onSubmit={vi.fn()} align='center' fullWidthButtons className='my-form'>
          <button type='submit'>Submit</button>
        </BaseForm>
      </FormContextProvider>
    ));

    const form = container.querySelector('form')!;
    expect(form.classList.contains(styles.alignCenter)).toBe(true);
    expect(form.classList.contains(styles.alignLeft)).toBe(false);
    expect(form.classList.contains(styles.fullWidthButtons)).toBe(true);
    expect(form.classList.contains('my-form')).toBe(true);
  });

  it('renders the errors prop alongside form-state errors', () => {
    const { store } = makeStore();
    const [, mutations] = store;
    mutations.setErrors(['State error']);

    render(() => (
      <FormContextProvider store={store}>
        <BaseForm onSubmit={vi.fn()} errors={['Server error']}>
          <button type='submit'>Submit</button>
        </BaseForm>
      </FormContextProvider>
    ));

    expect(screen.getByText('Server error')).toBeInTheDocument();
    expect(screen.getByText('State error')).toBeInTheDocument();
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
