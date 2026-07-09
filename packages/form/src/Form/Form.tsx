import { type JSX } from 'solid-js';

import { type FieldValueMapping } from '@gxxc/solid-forms-state';

import { type BaseFormProps, type BaseFormPropsWithSubmit } from '../BaseForm/BaseForm';
import { useForm } from '../hooks/useForm';
import {
  type StandardSchemaFormValues,
  type StandardSchemaSubmitValues,
  type StandardSchemaV1,
  type SubmitResponse,
  type SubmitResponseMapping
} from '../types';

export type SchemaFormProps<
  S extends StandardSchemaV1,
  R extends SubmitResponse | SubmitResponseMapping<StandardSchemaSubmitValues<S>>
> = BaseFormPropsWithSubmit<StandardSchemaFormValues<S>, StandardSchemaSubmitValues<S>, R> & {
  schema: S;
};

export function Form<
  S extends StandardSchemaV1,
  R extends SubmitResponse | SubmitResponseMapping<StandardSchemaSubmitValues<S>> = StandardSchemaSubmitValues<S>
>(props: SchemaFormProps<S, R>): JSX.Element;
export function Form<M extends object = FieldValueMapping, R extends SubmitResponse | SubmitResponseMapping<M> = M>(
  props: BaseFormProps<M, R>
): JSX.Element;
export function Form<
  M extends object = FieldValueMapping,
  O extends object = M,
  R extends SubmitResponse | SubmitResponseMapping<O> = O
>(props: BaseFormPropsWithSubmit<M, O, R>) {
  const form = useForm<M, O, R>({ schema: props.schema });
  return <form.Form {...props} />;
}
