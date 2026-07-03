---
"@gxxc/solid-forms": minor
---

Close remaining production-readiness gaps in submit handling, the submit button, and quality gates.

**Submit pipeline**

- Submitting now validates the whole form first: an invalid submit is blocked and every field is marked blurred (so errors become visible) instead of silently calling `onSubmit` or doing nothing.
- A thrown/rejected `onSubmit` error is now captured into `form.state.errors` instead of only being logged to the console. Each new submit attempt clears previous errors first.

**`SubmitButton` (breaking)**

- Renders a real `<button>` instead of `<input type="submit">`, so children are rendered as actual DOM content instead of being coerced into a `value` string. An empty `<SubmitButton />` still falls back to a "submit" label.
- The `type` prop, which collided with the native HTML button `type` attribute, is renamed to `variant` (`'primary' | 'approve'`). Update any `<SubmitButton type="approve">` usage to `<SubmitButton variant="approve">`.

**Fixes**

- Removed a leftover debug `console.log` from `InputField`.

**Quality gates**

- Added `no-console` to the shared ESLint config (allowing `warn`/`error`) so debug statements are caught in CI.
- Added a test suite and Vitest config for `@gxxc/solid-forms-elements` (previously untested).
- Added component tests for `CheckboxField`, `SubmitButton`, `TextAreaField`, and `PasswordField`.
- Added a rendered-DOM integration test suite for `BaseForm` covering the new submit-validation and error-surfacing behavior.
- Closed real coverage gaps in `@gxxc/solid-forms-state` (`FormContext`, `componentNameRegistry`, several untested getters/mutations) and raised per-package coverage thresholds to match.
- CI now runs `pnpm moon :coverage` so coverage thresholds are enforced, not just available locally.
