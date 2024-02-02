import { type FieldValueMapping } from '@gxxc/solid-forms-state';

import { type BaseFormProps } from '../BaseForm/BaseForm';
import { useForm } from '../hooks/useForm';
import { type Response, type ResponseMapping } from '../types';

export function Form<M extends FieldValueMapping, R extends Response | ResponseMapping<M>>(
  props: BaseFormProps<M, R>
) {
  const form = useForm<M, R>();
  return <form.Form {...props} />;
}
