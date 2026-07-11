import { batch } from 'solid-js';

import { type FormFields, type FormStateMutations } from '@gxxc/solid-forms-state';
import { type SchemaValidationFailure } from '@gxxc/solid-forms-validation';

export function applySchemaValidationFailure<M extends object>(
  fields: FormFields<M>,
  mutations: FormStateMutations<M>,
  failure: SchemaValidationFailure
) {
  batch(() => {
    mutations.setErrors(failure.formErrors);
    mutations.setFieldsErrors(failure.fieldErrors);
  });
}
