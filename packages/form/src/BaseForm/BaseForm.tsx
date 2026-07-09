import { For, type JSX, children, createMemo, mergeProps } from 'solid-js';

import {
  type ErrorMessages,
  getComponentName as lookupComponentName,
  useFormContext
} from '@gxxc/solid-forms-state';

import {
  type BaseFormOnSubmit,
  type RequestProps,
  type StandardSchemaV1,
  type SubmitResponse,
  type SubmitResponseMapping
} from '../types';
import styles from './BaseForm.module.css';
import { createBaseFormOnSubmitHandler } from './helpers';

export type BaseFormPropsWithSubmit<
  FieldValues extends RequestProps,
  SubmitValues extends RequestProps = FieldValues,
  R extends SubmitResponse | SubmitResponseMapping<SubmitValues> = SubmitValues
> = {
  className?: string;
  fullWidthButtons?: boolean;
  align?: 'center' | 'left';
  isLoading?: boolean;
  isProcessing?: boolean;
  errors?: ErrorMessages;
  schema?: StandardSchemaV1<FieldValues, SubmitValues>;
  onSubmit?: BaseFormOnSubmit<SubmitValues, R>;
  children: JSX.Element;
};

export type BaseFormProps<
  P extends RequestProps,
  R extends SubmitResponse | SubmitResponseMapping<P> = P
> = BaseFormPropsWithSubmit<P, P, R>;

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

export function BaseForm<
  FieldValues extends RequestProps,
  SubmitValues extends RequestProps = FieldValues,
  R extends SubmitResponse | SubmitResponseMapping<SubmitValues> = SubmitValues
>(initialProps: BaseFormPropsWithSubmit<FieldValues, SubmitValues, R>) {
  const props = mergeProps(baseFormDefaultProps, initialProps);
  const [formState, formStateMutations] = useFormContext<FieldValues>();

  const resolvedChildren = children(() => props.children);
  const formChildren = createMemo(() => classifyBaseFormChildren(resolvedChildren.toArray()));
  const formErrors = createMemo(() => [...(props.errors ?? []), ...formState.errors]);
  const onSubmitHandler = createBaseFormOnSubmitHandler<FieldValues, SubmitValues, R>(
    props,
    formState,
    formStateMutations
  );

  // `sf-form` is a stable, un-hashed hook consumers/themes can target, the rest
  // are hashed module classes that own the layout.
  const className = createMemo(() =>
    [
      'sf-form',
      styles.form,
      props.align === 'center' ? styles.alignCenter : styles.alignLeft,
      props.fullWidthButtons ? styles.fullWidthButtons : '',
      props.className ?? ''
    ]
      .filter(Boolean)
      .join(' ')
  );

  return (
    <form
      class={className()}
      onSubmit={(event) => {
        void onSubmitHandler(event);
      }}
    >
      <For each={formChildren().bodyChildren}>{({ child, wrap }) => (wrap ? <div>{child}</div> : child)}</For>
      <For each={formChildren().formButtons}>{(child) => <div>{child}</div>}</For>
      <For each={formChildren().footerLinks}>{(child) => <div>{child}</div>}</For>
      <For each={formErrors()}>{(child) => <div>{child}</div>}</For>
    </form>
  );
}

export default BaseForm;
