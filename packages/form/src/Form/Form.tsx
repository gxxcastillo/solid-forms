import { FieldValueMapping } from '@gxxc/solid-forms-state';

import { BaseFormProps } from '../BaseForm/BaseForm';
import { useForm } from '../hooks/useForm';

export function Form<M extends FieldValueMapping>(props: BaseFormProps) {
  const form = useForm<M>();
  return <form.Form {...props} />;
}
