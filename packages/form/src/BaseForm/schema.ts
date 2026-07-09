import { batch } from 'solid-js';

import { type ErrorMessages, type FormFields, type FormStateMutations } from '@gxxc/solid-forms-state';

import { type StandardSchemaV1, type StandardSchemaV1Issue } from '../types';

export type SchemaValidationFailure = {
  valid: false;
  fieldErrors: Map<string, ErrorMessages>;
  formErrors: ErrorMessages;
};

export type SchemaValidationSuccess<M extends object> = {
  valid: true;
  value: M;
};

export type SchemaValidationResult<M extends object> = SchemaValidationSuccess<M> | SchemaValidationFailure;

function isPathSegment(
  segment: PropertyKey | { readonly key: PropertyKey }
): segment is { readonly key: PropertyKey } {
  return typeof segment === 'object' && segment !== null && 'key' in segment;
}

export function schemaIssuePathToFieldName(issue: StandardSchemaV1Issue) {
  if (!issue.path?.length) return undefined;

  return issue.path.map((segment) => String(isPathSegment(segment) ? segment.key : segment)).join('.');
}

export function groupSchemaIssuesByField<M extends object>(
  issues: ReadonlyArray<StandardSchemaV1Issue>,
  fields: FormFields<M>
): SchemaValidationFailure {
  const fieldNames = new Set<string>(fields.map((field) => field.name));
  const fieldErrors = new Map<string, ErrorMessages>();
  const formErrors: string[] = [];

  for (const issue of issues) {
    const fieldName = schemaIssuePathToFieldName(issue);

    if (!fieldName || !fieldNames.has(fieldName)) {
      formErrors.push(issue.message);
      continue;
    }

    fieldErrors.set(fieldName, [...(fieldErrors.get(fieldName) ?? []), issue.message]);
  }

  return {
    valid: false,
    fieldErrors,
    formErrors
  };
}

export async function validateWithSchema<
  FieldValues extends object,
  SubmitValues extends object = FieldValues
>(
  schema: StandardSchemaV1<FieldValues, SubmitValues> | undefined,
  values: FieldValues,
  fields: FormFields<FieldValues>
): Promise<SchemaValidationResult<SubmitValues>> {
  if (!schema) {
    return {
      valid: true,
      value: values as unknown as SubmitValues
    };
  }

  const result = await schema['~standard'].validate(values);

  if (result.issues) {
    return groupSchemaIssuesByField(result.issues, fields);
  }

  return {
    valid: true,
    value: result.value
  };
}

export function applySchemaValidationFailure<M extends object>(
  fields: FormFields<M>,
  mutations: FormStateMutations<M>,
  failure: SchemaValidationFailure
) {
  batch(() => {
    mutations.setErrors(failure.formErrors);

    for (const field of fields) {
      mutations.setFieldErrors(field.name, failure.fieldErrors.get(field.name) ?? []);
      mutations.setBlurredField(field.name);
    }
  });
}
