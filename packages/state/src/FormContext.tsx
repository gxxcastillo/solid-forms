import { JSX, children, createContext, useContext } from 'solid-js';

import { BaseFormState, FieldValueMapping, FormState, FormStateMutations } from '.';
import { createFormStore } from './FormState';

export const FormContext = createFormContext();

export interface FormContextProviderProps<M extends FieldValueMapping> {
  state?: BaseFormState<M>;
  children: JSX.Element;
}

export function createFormContext<M extends FieldValueMapping>() {
  return createContext([] as unknown as readonly [FormState<M>, FormStateMutations<M>]);
}

export function useFormContext() {
  return useContext(FormContext);
}

export function FormContextProvider<M extends FieldValueMapping>(props: FormContextProviderProps<M>) {
  const store = createFormStore<M>(props.state) as unknown as readonly [FormState<M>, FormStateMutations<M>];
  return <FormContext.Provider value={store}>{children(() => props.children)()}</FormContext.Provider>;
}
