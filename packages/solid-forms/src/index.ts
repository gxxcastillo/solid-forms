// Ships the default design tokens with the structural CSS so a bare
// `import '@gxxc/solid-forms/styles.css'` renders a complete, usable form.
// Themes (themes/*.css) only override these variables.
import '../themes/base.css';

export * from '@gxxc/solid-forms-fields';
export * from '@gxxc/solid-forms-form';

// `useForm().state` is typed against these — without re-exporting them a
// consumer can't name the type (e.g. to write their own `state: FormState<M>`
// prop), only rely on structural inference.
export type {
  BaseFormState,
  ErrorMessage,
  ErrorMessages,
  FieldName,
  FieldValue,
  FieldValueMapping,
  FormField,
  FormFields,
  FormState,
  FormStateGetters,
  FormStateMutations,
  FormStore
} from '@gxxc/solid-forms-state';
