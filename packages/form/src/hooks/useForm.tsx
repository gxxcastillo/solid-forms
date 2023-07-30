import {
  FormContextProvider,
  FormContextProviderProps,
  useFormContext
} from '@gxxc/solid-forms-state';

import { BaseForm, BaseFormProps } from '../BaseForm/BaseForm';

export type FormComponentProps = BaseFormProps & FormContextProviderProps;

export function useForm() {
  function Form(props: FormComponentProps) {
    const existingContext = useFormContext();

    // Use an existing parent context if it exists
    if (Object.keys(existingContext).length > 0) {
      return <BaseForm {...props} {...formStateMutations} />;
    }

    // else, create a new context
    return (
      <FormContextProvider>
        <BaseForm {...props} {...formStateMutations} />
      </FormContextProvider>
    );
  }

  const [formState, formStateMutations] = useFormContext();
  return {
    Form,
    state: formState
  };
}
