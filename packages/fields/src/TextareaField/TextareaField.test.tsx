import { render } from '@testing-library/react';

import useFormField from './TextareaField';

describe('useFormField', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<useFormField name='testuseFormField' />);
    expect(baseElement).toBeTruthy();
  });
});
