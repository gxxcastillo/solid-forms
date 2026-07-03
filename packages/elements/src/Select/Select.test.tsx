import { cleanup, render } from '@solidjs/testing-library';
import { afterEach, describe, expect, it } from 'vitest';

import { Select } from './Select';

describe('Select', () => {
  afterEach(cleanup);

  it('renders a <select> with its options', () => {
    const { container } = render(() => (
      <Select id='role' value='admin'>
        <option value='admin'>Admin</option>
        <option value='member'>Member</option>
      </Select>
    ));
    const select = container.querySelector('select');

    expect(select).not.toBeNull();
    expect(select).toHaveAttribute('id', 'role');
    expect(select?.querySelectorAll('option')).toHaveLength(2);
  });

  it('forwards the disabled attribute', () => {
    const { container } = render(() => <Select id='role' disabled />);

    expect(container.querySelector('select')).toBeDisabled();
  });
});
