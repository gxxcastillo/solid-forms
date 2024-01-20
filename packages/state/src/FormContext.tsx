import { type Context, JSX, children, createContext, useContext } from 'solid-js';

import { createFormStore } from './FormState';
import { FieldValueMapping, FormStore } from './types';

export const FormContext = createFormContext();

export interface FormContextProviderProps<M extends FieldValueMapping> {
  store?: FormStore<M>;
  children: JSX.Element;
}

export function createFormContext() {
  return createContext([]);
}

export function useFormContext<M extends FieldValueMapping>() {
  return useContext(FormContext) as unknown as FormStore<M>;
}

export function FormContextProvider<M extends FieldValueMapping>(props: FormContextProviderProps<M>) {
  const Context = FormContext as unknown as Context<FormStore<M>>;
  const store: FormStore<M> = props.store ? props.store : createFormStore<M>();
  return <Context.Provider value={store}>{children(() => props.children)()}</Context.Provider>;
}
