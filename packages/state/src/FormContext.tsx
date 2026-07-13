import { type Context, type JSX, createContext, useContext } from 'solid-js';

import { createFormStore } from './FormState';
import { type FieldValueMapping, type FormStore } from './types';

export const FormContext = createFormContext();

export type FormContextProviderProps<M extends object = FieldValueMapping> = {
  store?: FormStore<M>;
  children: JSX.Element;
};

export function createFormContext() {
  return createContext([]);
}

export function useFormContext<M extends object = FieldValueMapping>() {
  return useContext(FormContext) as unknown as FormStore<M>;
}

export function FormContextProvider<M extends object = FieldValueMapping>(
  props: FormContextProviderProps<M>
) {
  const Context = FormContext as unknown as Context<FormStore<M>>;
  const store: FormStore<M> = props.store ? props.store : createFormStore<M>();
  // Forward props.children directly — no `children()` helper. This never
  // inspects/transforms children (unlike BaseForm.tsx, which needs
  // `.toArray()` to classify them), so `children()` bought nothing here and
  // actively broke two things when used: called inline as
  // `children(() => props.children)()`, the whole expression sat inside the
  // reactive computation the JSX compiler wraps around this child position,
  // so it built a *fresh* children() memo — and therefore called
  // props.children again — every time that computation re-ran, not just
  // once at setup (only visible once the resolved children contain their
  // own dynamic content whose shape can change, e.g. a useFieldArray-backed
  // <For> shrinking, which reran the *entire* wrapped subtree from scratch,
  // discarding whatever reactive state it had built up). Hoisting the
  // `children()` call out to fix that re-invocation instead broke context:
  // `children(fn)` evaluates `fn` eagerly at creation time, so hoisted
  // above this function's `return`, it ran before `<Context.Provider>` even
  // existed, and any descendant reading `useFormContext()` during its own
  // setup (e.g. useFieldArray) saw the default (empty) context instead of
  // `store`. Plain passthrough has neither problem.
  return <Context.Provider value={store}>{props.children}</Context.Provider>;
}
