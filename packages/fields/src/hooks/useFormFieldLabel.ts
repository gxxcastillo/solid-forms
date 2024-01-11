export interface UseFormFieldLabelProps {
  value?: unknown;
  label?: string;
}

export function useFormFieldLabel({ value, label }: UseFormFieldLabelProps) {
  if (value) {
    return {
      label
    };
  }

  return {
    placeholder: label
  };
}
