import { batch } from 'solid-js';

import {
  buildObjectFromFieldEntries,
  type FormFields,
  type FormState,
  type FormStateMutations
} from '@gxxc/solid-forms-state';
import { validateWithSchema } from '@gxxc/solid-forms-validation';

import {
  type BaseFormElementSubmitEvent,
  type BaseFormOnSubmit,
  type OnSubmitHandler,
  type OnSubmitHandlers,
  type RequestProps,
  type SubmitResponse,
  type SubmitResponseMapping
} from '../types';
import { type BaseFormPropsWithSubmit } from './BaseForm';
import { applySchemaValidationFailure } from './schema';

export function isObject(o: unknown) {
  return o != null && typeof o === 'object';
}

export function isSubmitHandlerFn<P extends RequestProps, R extends SubmitResponse>(
  onSubmit: unknown
): onSubmit is OnSubmitHandler<P, R> {
  return typeof onSubmit === 'function';
}

export function isSubmitHandlersObject<P extends RequestProps, R extends SubmitResponse | SubmitResponseMapping<P>>(
  onSubmit: BaseFormOnSubmit<P, R>
): onSubmit is R extends SubmitResponseMapping<P> ? OnSubmitHandlers<P, R> : never {
  return isObject(onSubmit);
}

function setOwnEnumerableProperty(target: Record<string, unknown>, name: string, value: unknown) {
  Object.defineProperty(target, name, {
    configurable: true,
    enumerable: true,
    value,
    writable: true
  });
}

export function fieldsToProps<M extends object>(formFields: FormFields<M>) {
  return buildObjectFromFieldEntries(formFields.map((field) => [field.name, field.value])) as M;
}

// Captured separately from fieldsToProps so the staleness check can compare
// exactly the same value snapshot even if fieldsToProps changes shape later.
export function fieldsToValueSnapshot<M extends object>(formFields: FormFields<M>) {
  return formFields.reduce<Record<string, unknown>>((obj, field) => {
    setOwnEnumerableProperty(obj, field.name, field.value);
    return obj;
  }, {});
}

// Captured alongside fieldsToProps, at the same moment, so
// haveFieldValuesChangedSinceSnapshot can detect a resetField/reset/setValues
// call that bumps a field's generation without changing its value (e.g.
// resetting a field back to a value it already held) — a value-only
// comparison would miss that case even though the field's errors/hasBeenValid
// were rewritten out from under the in-flight validation.
export function fieldsToGenerationSnapshot<M extends object>(formFields: FormFields<M>) {
  return formFields.reduce<Record<string, number>>((obj, field) => {
    Object.defineProperty(obj, field.name, {
      configurable: true,
      enumerable: true,
      value: field.generation,
      writable: true
    });
    return obj;
  }, {});
}

// Only compares fields the snapshot actually captured: a field mounting or
// unmounting between the snapshot and this check doesn't make the snapshot
// stale, since onSubmit/schema validation only ever sees the values captured
// at snapshot time, not a live re-read of the form's current fields.
export function haveFieldValuesChangedSinceSnapshot<M extends object>(
  formFields: FormFields<M>,
  snapshot: Readonly<Record<string, unknown>>,
  generationSnapshot: Readonly<Record<string, number>>
) {
  return formFields.some(
    (field) =>
      Object.hasOwn(snapshot, field.name) &&
      (snapshot[field.name] !== field.value || generationSnapshot[field.name] !== field.generation)
  );
}

export function resolveSubmitHandler<P extends RequestProps, R extends SubmitResponse | SubmitResponseMapping<P>>(
  onSubmit: BaseFormOnSubmit<P, R> | undefined,
  buttonName: string | undefined
): OnSubmitHandler<P, R> | undefined {
  if (isSubmitHandlerFn<P, R>(onSubmit)) return onSubmit;
  if (!onSubmit || !isSubmitHandlersObject<P, R>(onSubmit)) return undefined;

  const handlers = onSubmit as unknown as Record<string, OnSubmitHandler<P, R>>;
  const matched = buttonName ? handlers[buttonName] : undefined;
  if (matched) return matched;

  // No named submitter (e.g. the form was submitted via the Enter key) or an
  // unmatched name. If the map has a single handler it is unambiguous, so use it
  // rather than silently doing nothing; with multiple handlers we can't guess.
  const handlerList = Object.values(handlers);
  return handlerList.length === 1 ? handlerList[0] : undefined;
}

export function getSubmitErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createBaseFormOnSubmitHandler<
  FieldValues extends RequestProps,
  SubmitValues extends RequestProps = FieldValues,
  R extends SubmitResponse | SubmitResponseMapping<SubmitValues> = SubmitValues
>(
  props: BaseFormPropsWithSubmit<FieldValues, SubmitValues, R>,
  formState: FormState<FieldValues>,
  formStateMutations: FormStateMutations<FieldValues>
) {
  return async (event: BaseFormElementSubmitEvent) => {
    event.preventDefault();
    const buttonName = (event.submitter as HTMLButtonElement | HTMLInputElement | null)?.name ?? '';

    if (formState.isProcessing) {
      return;
    }

    if (!formState.isFormValid) {
      // Nothing may have been touched yet (e.g. a pristine required field), so
      // an invalid submit attempt must mark every field blurred to make its
      // errors visible instead of silently doing nothing.
      formStateMutations.setBlurredFields();
      return;
    }

    const onSubmitFn = resolveSubmitHandler<SubmitValues, R>(props.onSubmit, buttonName);

    // resolveSubmitHandler also returns undefined for an ambiguous/unmatched
    // named handler (props.onSubmit is set but ambiguous) rather than for no
    // onSubmit at all. Only the latter should still validate via schema, since
    // the former will never invoke a handler regardless of validation outcome.
    if (!onSubmitFn && (props.onSubmit !== undefined || !props.schema)) return;

    const submitProps = fieldsToProps(formState.fields) as FieldValues;
    const submitValueSnapshot = fieldsToValueSnapshot(formState.fields);
    const submitGenerations = fieldsToGenerationSnapshot(formState.fields);

    // Set the processing flag before invoking schema validation or the submit
    // handler so a rapid second submit cannot slip past the guard while async
    // work is still awaited.
    formStateMutations.setIsProcessing(true);
    formStateMutations.setErrors([]);
    try {
      // A thrown/rejected validate() call is a genuine error (network failure,
      // schema bug), not stale data, so it always propagates to the outer catch
      // below rather than being discarded when field values have since changed.
      const schemaResult = props.schema
        ? await validateWithSchema<FieldValues, SubmitValues>(props.schema, submitProps, formState.fields)
        : ({
            valid: true,
            value: submitProps as unknown as SubmitValues
          } as const);

      if (
        props.schema &&
        haveFieldValuesChangedSinceSnapshot(formState.fields, submitValueSnapshot, submitGenerations)
      ) {
        return;
      }

      if (!schemaResult.valid) {
        batch(() => {
          applySchemaValidationFailure(formState.fields, formStateMutations, schemaResult);
          formStateMutations.setBlurredFields();
        });
        return;
      }

      if (!onSubmitFn) return;

      const result = onSubmitFn(schemaResult.value, buttonName);
      if (result?.then) {
        await result;
      }
    } catch (error) {
      formStateMutations.setErrors([getSubmitErrorMessage(error)]);
    } finally {
      // Always clear the processing flag, even when the handler throws/rejects.
      formStateMutations.setIsProcessing(false);
    }
  };
}
