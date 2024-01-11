import {
  BaseFormState,
  FieldValueMapping,
  FormContextProvider,
  FormState,
  createFormState,
  useFormContext
} from '@gxxc/solid-forms-state';

import { BaseForm, BaseFormProps } from '../BaseForm/BaseForm';

export type FormComponentProps = BaseFormProps;

export function useForm<M extends FieldValueMapping>() {
  const existingContext = useFormContext() as [FormState<M>, unknown];
  const existingState = existingContext[0];
  const [formState] = existingState ? existingContext : createFormState();

  return {
    Form: (props: FormComponentProps) => {
      if (existingState) {
        return <BaseForm {...props} />;
      }

      return (
        <FormContextProvider state={formState as unknown as BaseFormState<M>}>
          <BaseForm {...props} />
        </FormContextProvider>
      );
    },

    get state() {
      return formState;
    }
  };
}
