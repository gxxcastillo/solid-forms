import type { CustomValidator, FormatFunction, FormFieldProps, ParseFunction } from '@gxxc/solid-forms';

// Compile-only regression fixture: proves FormFieldProps/CustomValidator/
// ParseFunction/FormatFunction resolve through the public `@gxxc/solid-forms`
// facade, matching what custom-fields.md and validation.md tell users to
// import (strategic-backlog.md B2 — these were defined but never re-exported).

export interface RatingFormValues {
  [key: string]: number;
  rating: number;
}

export const parseRating: ParseFunction<number> = (raw) => Number(raw ?? 0);

export const formatRating: FormatFunction<number> = (val) => (val != null ? String(val) : '');

export const validateRating: CustomValidator<RatingFormValues, 'rating'> = (
  name,
  value,
  formState,
  setFieldErrors
) => {
  if (value < 1 || value > 5) {
    setFieldErrors(['Rating must be between 1 and 5']);
  }
};

export function describeRatingField(props: FormFieldProps<'input', RatingFormValues, 'rating'>) {
  return props.name;
}
