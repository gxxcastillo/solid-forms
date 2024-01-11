import { For, JSX, children, mergeProps } from 'solid-js';

import { useFormContext } from '@gxxc/solid-forms-state';

import { BaseFormOnSubmit, FormErrors } from '../types';
import { createBaseFormOnSubmitHandler } from './helpers';

export interface BaseFormProps {
  className?: string;
  fullWidthButtons?: boolean;
  align?: 'center' | 'left';
  isLoading?: boolean;
  isProcessing?: boolean;
  errors?: FormErrors;
  onSubmit?: BaseFormOnSubmit;
  children: JSX.Element;
}

export const baseFormDefaultProps = {
  align: 'left',
  fullWidthButtons: false
} as const;

export function BaseForm(initialProps: BaseFormProps) {
  const props = mergeProps(baseFormDefaultProps, initialProps);
  const [formState, formStateMutations] = useFormContext();

  const footerLinks: JSX.Element[] = [];
  const formButtons: JSX.Element[] = [];
  const classList = {};
  const childrenArray = children(() => props.children).toArray();
  const onSubmitHandler = createBaseFormOnSubmitHandler(props, formState, formStateMutations);

  return (
    <form classList={classList} onSubmit={onSubmitHandler}>
      <For each={childrenArray}>
        {(child) => {
          const componentName = (child as unknown as { componentName: string })?.componentName;
          if (componentName.includes('Button')) {
            formButtons.push(child);
            return;
          }

          if (componentName === 'Link') {
            footerLinks.push(child);
            return;
          }

          if (componentName.includes('Field')) {
            return child;
          }

          return <div>{child}</div>;
        }}
      </For>

      <For each={formState.errors}>{(child) => <div>{child}</div>}</For>
    </form>
  );
}

export default BaseForm;
