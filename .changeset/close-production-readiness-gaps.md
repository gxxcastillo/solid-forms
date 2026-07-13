---
'@gxxc/solid-forms': minor
---

Close production-readiness gaps across submit handling, buttons, tests, and CI.

**Submit pipeline**

- Invalid submits are blocked and mark every field blurred, making errors visible immediately.
- Thrown or rejected `onSubmit` errors are captured in `form.state.errors`. Each new submit clears previous form-level errors first.

**`SubmitButton` (breaking)**

- `SubmitButton` now renders a real `<button>`, so children render as normal DOM content. An empty `<SubmitButton />` still falls back to `submit`.
- The old `type` variant prop is renamed to `variant` to avoid colliding with the native button `type` attribute. Update `<SubmitButton type="approve">` to `<SubmitButton variant="approve">`.

**Fixes**

- Removed a leftover debug `console.log` from `InputField`.

**Quality gates**

- Added coverage for elements, field components, form submit flows, and state helpers.
- Added `no-console` linting and CI coverage enforcement.
