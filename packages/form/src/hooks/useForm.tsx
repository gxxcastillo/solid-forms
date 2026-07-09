import { type JSX } from 'solid-js';

import {
  type FieldValueMapping,
  FormContextProvider,
  type FormState,
  type FormStore,
  createFormStore,
  useFormContext
} from '@gxxc/solid-forms-state';

import { BaseForm, type BaseFormPropsWithSubmit } from '../BaseForm/BaseForm';
import {
  type RequestProps,
  type Response,
  type ResponseMapping,
  type StandardSchemaFormValues,
  type StandardSchemaSubmitValues,
  type StandardSchemaV1
} from '../types';

export type FormComponentProps<
  FieldValues extends RequestProps,
  SubmitValues extends RequestProps = FieldValues,
  R extends Response | ResponseMapping<SubmitValues> = SubmitValues
> = BaseFormPropsWithSubmit<FieldValues, SubmitValues, R>;

export type UseFormOptions<S extends StandardSchemaV1 = StandardSchemaV1> = {
  schema?: S;
};

export type UseFormReturn<
  FieldValues extends RequestProps,
  SubmitValues extends RequestProps = FieldValues,
  R extends Response | ResponseMapping<SubmitValues> = SubmitValues
> = {
  Form: (props: FormComponentProps<FieldValues, SubmitValues, R>) => JSX.Element;
  readonly store: FormStore<FieldValues>;
  readonly state: FormState<FieldValues>;
};

export function useForm<
  S extends StandardSchemaV1,
  R extends Response | ResponseMapping<StandardSchemaSubmitValues<S>> = StandardSchemaSubmitValues<S>
>(
  options: UseFormOptions<S> & { schema: S }
): UseFormReturn<StandardSchemaFormValues<S>, StandardSchemaSubmitValues<S>, R>;
export function useForm<
  FieldValues extends RequestProps,
  SubmitValues extends RequestProps,
  R extends Response | ResponseMapping<SubmitValues> = SubmitValues
>(
  // `schema` is a required key (unlike UseFormOptions) so FieldValues and
  // SubmitValues can't be pinned to different types without at least
  // acknowledging a schema is (or isn't) in play; omitting the whole call
  // falls through to the single-generic, schema-less overload below instead.
  options: { schema: StandardSchemaV1<FieldValues, SubmitValues> | undefined }
): UseFormReturn<FieldValues, SubmitValues, R>;
export function useForm<
  M extends RequestProps = FieldValueMapping,
  R extends Response | ResponseMapping<M> = M
>(options?: UseFormOptions): UseFormReturn<M, M, R>;
export function useForm<
  FieldValues extends RequestProps = FieldValueMapping,
  SubmitValues extends RequestProps = FieldValues,
  R extends Response | ResponseMapping<SubmitValues> = SubmitValues
>(options: UseFormOptions<StandardSchemaV1<FieldValues, SubmitValues>> = {}) {
  const existingStore = useFormContext<FieldValues>();
  const hasExistingStore = !!existingStore.length;
  const formStore = hasExistingStore ? existingStore : createFormStore<FieldValues>();

  return {
    Form: (props: FormComponentProps<FieldValues, SubmitValues, R>) => {
      if (hasExistingStore) {
        return <BaseForm {...props} schema={props.schema ?? options.schema} />;
      }

      return (
        <FormContextProvider store={formStore}>
          <BaseForm {...props} schema={props.schema ?? options.schema} />
        </FormContextProvider>
      );
    },

    get store() {
      return formStore;
    },

    get state() {
      return formStore[0];
    }
  };
}
