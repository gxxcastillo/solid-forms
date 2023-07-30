import { BaseFormProps } from '../BaseForm/BaseForm';
import { useForm } from '../hooks/useForm';

export function Form(props: BaseFormProps) {
  const { Form: FormComponent } = useForm();
  return <FormComponent {...props} />;
}
