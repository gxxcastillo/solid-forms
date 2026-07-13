import { describe, expect, it } from 'vitest';

import { CheckboxField } from './CheckboxField/CheckboxField';
import { InputField } from './InputField/InputField';
import { PasswordField } from './PasswordField/PasswordField';
import { TextAreaField } from './TextareaField/TextareaField';
import { createFields } from './createFields';

describe('createFields', () => {
  it('returns the base field components bound to the requested form type', () => {
    const fields = createFields<{ username: string; accepted: boolean }>();

    expect(fields).toEqual({
      InputField,
      PasswordField,
      TextAreaField,
      CheckboxField
    });
  });
});
