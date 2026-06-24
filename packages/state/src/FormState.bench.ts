import { createRoot } from 'solid-js';
import { bench, describe } from 'vitest';

import { createFormStore } from './FormState';

describe('createFormStore — large form performance', () => {
  bench('initialize 100 fields', () => {
    createRoot((dispose) => {
      const [, mutations] = createFormStore();
      for (let i = 0; i < 100; i++) {
        mutations.initializeField(`field_${i}`, `value_${i}`, []);
      }
      dispose();
    });
  });

  bench('set values on 100 initialized fields', () => {
    createRoot((dispose) => {
      const [, mutations] = createFormStore();
      for (let i = 0; i < 100; i++) {
        mutations.initializeField(`field_${i}`, `value_${i}`, []);
      }
      for (let i = 0; i < 100; i++) {
        mutations.setFieldValue(`field_${i}`, `updated_${i}`);
      }
      dispose();
    });
  });

  bench('read 100 field values after update', () => {
    createRoot((dispose) => {
      const [state, mutations] = createFormStore();
      for (let i = 0; i < 100; i++) {
        mutations.initializeField(`field_${i}`, `value_${i}`, []);
      }
      for (let i = 0; i < 100; i++) {
        state.getField(`field_${i}`);
      }
      dispose();
    });
  });
});
