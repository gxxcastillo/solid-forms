---
'@gxxc/solid-forms': minor
---

Export the state types that `useForm().state` is built from — `FormState`, `FormField`, `FormFields`, `FieldValueMapping`, `FormStateGetters`, `FormStateMutations`, `FormStore`, `BaseFormState`, `ErrorMessage`, `ErrorMessages`, `FieldName`, and `FieldValue`. Previously these were used throughout the public API (e.g. to type `useForm`'s return value and every field component's props) but were never themselves exported, so consumers had no way to name them — e.g. to write their own `state: FormState<MyValues>` prop — short of a `ReturnType<typeof useForm>` workaround.
