import { JSX, createContext, useContext } from 'solid-js';

import { createFormState } from './FormState';

export interface FormContextProviderProps {
  children: JSX.Element;
}

export function createFormContext() {
  const initialFormState = createFormState();
  return createContext(initialFormState);
}

export function useFormContext() {
  return useContext(FormContext);
}

export function FormContextProvider({ children }: FormContextProviderProps) {
  const store = createFormState();
  return <FormContext.Provider value={store}>{children}</FormContext.Provider>;
}

export const FormContext = createFormContext();
