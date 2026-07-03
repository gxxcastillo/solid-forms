import { For, type JSX, children, createMemo, mergeProps } from 'solid-js';

import { getComponentName as lookupComponentName, useFormContext } from '@gxxc/solid-forms-state';

import {
  type BaseFormOnSubmit,
  type FormErrors,
  type RequestProps,
  type Response,
  type ResponseMapping
} from '../types';
import { createBaseFormOnSubmitHandler } from './helpers';

export type BaseFormProps<P extends RequestProps, R extends Response | ResponseMapping<P>> = {
  className?: string;
  fullWidthButtons?: boolean;
  align?: 'center' | 'left';
  isLoading?: boolean;
  isProcessing?: boolean;
  errors?: FormErrors;
  onSubmit?: BaseFormOnSubmit<P, R>;
  children: JSX.Element;
};

export const baseFormDefaultProps = {
  align: 'left',
  fullWidthButtons: false
} as const;

export type ClassifiedBaseFormChild = {
  child: JSX.Element;
  wrap: boolean;
};

function getComponentName(child: JSX.Element) {
  if (!child || typeof child !== 'object') {
    return undefined;
  }

  return lookupComponentName(child);
}

export function classifyBaseFormChildren(childrenArray: JSX.Element[]) {
  const bodyChildren: ClassifiedBaseFormChild[] = [];
  const footerLinks: JSX.Element[] = [];
  const formButtons: JSX.Element[] = [];

  for (const child of childrenArray) {
    const componentName = getComponentName(child);
    if (componentName?.includes('Button')) {
      formButtons.push(child);
    } else if (componentName === 'Link') {
      footerLinks.push(child);
    } else if (componentName?.includes('Field')) {
      bodyChildren.push({ child, wrap: false });
    } else {
      bodyChildren.push({ child, wrap: true });
    }
  }

  return { bodyChildren, footerLinks, formButtons };
}

export function BaseForm<P extends RequestProps, R extends Response | ResponseMapping<P>>(
  initialProps: BaseFormProps<P, R>
) {
  const props = mergeProps(baseFormDefaultProps, initialProps);
  const [formState, formStateMutations] = useFormContext();

  const classList = {};
  const resolvedChildren = children(() => props.children);
  const formChildren = createMemo(() => classifyBaseFormChildren(resolvedChildren.toArray()));
  const onSubmitHandler = createBaseFormOnSubmitHandler<P, R>(props, formState, formStateMutations);

  return (
    <form
      classList={classList}
      onSubmit={(event) => {
        void onSubmitHandler(event);
      }}
    >
      <For each={formChildren().bodyChildren}>
        {({ child, wrap }) => (wrap ? <div>{child}</div> : child)}
      </For>
      <For each={formChildren().formButtons}>{(child) => <div>{child}</div>}</For>
      <For each={formChildren().footerLinks}>{(child) => <div>{child}</div>}</For>
      <For each={formState.errors}>{(child) => <div>{child}</div>}</For>
    </form>
  );
}

export default BaseForm;
