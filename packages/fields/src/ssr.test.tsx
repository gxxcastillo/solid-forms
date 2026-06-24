import { generateHydrationScript, renderToString } from 'solid-js/web';
import { describe, expect, it } from 'vitest';
import { FormContextProvider, createFormStore } from '@gxxc/solid-forms-state';
import { createRoot } from 'solid-js';

import { InputField } from './InputField/InputField';

type TestForm = { [key: string]: string; email: string };

describe('SSR / renderToString smoke tests', () => {
  it('renders InputField to string without throwing', () => {
    const store = createRoot((d) => {
      const s = createFormStore<TestForm>();
      d();
      return s;
    });

    let html: string | undefined;
    expect(() => {
      html = renderToString(() => (
        <FormContextProvider store={store}>
          <InputField<TestForm, 'email'> name='email' label='Email' required />
        </FormContextProvider>
      ));
    }).not.toThrow();

    // In a true SSR/Node environment html will be a string; in a browser
    // environment solid-js returns undefined (but does not throw).
    if (typeof html === 'string') {
      expect(html).toContain('input');
      expect(html).toContain('email');
    } else {
      expect(html).toBeUndefined();
    }
  });

  it('generateHydrationScript does not throw', () => {
    expect(() => generateHydrationScript()).not.toThrow();
  });
});
