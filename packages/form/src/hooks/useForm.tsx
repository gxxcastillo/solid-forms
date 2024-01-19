import {
  FieldValueMapping,
  FormContextProvider,
  createFormStore,
  useFormContext
} from '@gxxc/solid-forms-state';

import { BaseForm, BaseFormProps } from '../BaseForm/BaseForm';
import { RequestProps, Response, ResponseMapping } from '../types';

export type FormComponentProps<
  P extends RequestProps,
  R extends Response | ResponseMapping<P>
> = BaseFormProps<P, R>;

export function useForm<M extends FieldValueMapping, R extends Response | ResponseMapping<M>>() {
  const existingContext = useFormContext<M>();
  const existingState = existingContext[0];
  const formStore = existingState ? existingContext : createFormStore<M>();

  return {
    Form: (props: FormComponentProps<M, R>) => {
      if (existingState) {
        return <BaseForm {...props} />;
      }

      return (
        <FormContextProvider store={formStore}>
          <BaseForm {...props} />
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
