import {
  type FieldValueMapping,
  FormContextProvider,
  createFormStore,
  useFormContext
} from '@gxxc/solid-forms-state';

import { BaseForm, type BaseFormProps } from '../BaseForm/BaseForm';
import { type RequestProps, type Response, type ResponseMapping } from '../types';

export type FormComponentProps<
  P extends RequestProps,
  R extends Response | ResponseMapping<P>
> = BaseFormProps<P, R>;

export function useForm<M extends FieldValueMapping, R extends Response | ResponseMapping<M> = M>() {
  const existingStore = useFormContext<M>();
  const hasExistingStore = !!existingStore.length;
  const formStore = hasExistingStore ? existingStore : createFormStore<M>();

  return {
    Form: (props: FormComponentProps<M, R>) => {
      if (hasExistingStore) {
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
