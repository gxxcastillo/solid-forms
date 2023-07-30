import { For, JSX, children, createSignal, mergeProps } from 'solid-js';

import { useFormContext } from '@gxxc/solid-forms-state';

import { FormContextProps } from '../types';
import { BaseFormOnSubmit, createBaseFormOnSubmitHandler } from './helpers';

export interface BaseFormProps<E = Error> {
  className?: string;
  fullWidthButtons?: boolean;
  align?: 'center' | 'left';
  isLoading?: boolean;
  isProcessing?: boolean;
  error?: E;
  errors?: 'GraphQLFieldErrors - TODO';
  onSubmit?: BaseFormOnSubmit;
  onUpdate?: (c: FormContextProps) => void;
  children: JSX.Element;
}

const formFieldTypes = [''];
const formButtonTypes = [''];

const propNames = [
  'className',
  'isLoading',
  'isProcessing',
  'align',
  'fullWidthButtons',
  'error',
  'errors',
  'onSubmit',
  'onUpdate'
] as const;

export const baseFormDefaultProps = {
  isLoading: false,
  isProcessing: false,
  align: 'left',
  fullWidthButtons: false
};

export function BaseForm(initialProps: BaseFormProps) {
  const props = mergeProps(baseFormDefaultProps, initialProps);
  const [getFormError, setFormError] = createSignal();
  const [formState, formStateSetters] = useFormContext();

  const errorMessage = props?.error?.message || getFormError();
  const footerLinks: JSX.Element[] = [];
  const formButtons: JSX.Element[] = [];
  const classList = {};
  const childrenArray = children(() => props.children).toArray();
  const onSubmitHandler = createBaseFormOnSubmitHandler(props, formState, formStateSetters);

  return (
    <form classList={classList} onSubmit={onSubmitHandler}>
      <For each={childrenArray}>
        {(child) => {
          const type = (child as HTMLInputElement)?.type;
          if (formButtonTypes.includes(type)) {
            formButtons.push(child);
            return;
          }

          if (type === 'Link') {
            footerLinks.push(child);
            return;
          }

          if (!formFieldTypes.includes(type)) {
            return child;
          }

          return <div>{child}</div>;
        }}
      </For>
    </form>
  );
}

export default BaseForm;
