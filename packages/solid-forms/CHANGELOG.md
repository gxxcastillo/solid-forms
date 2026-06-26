# @gxxc/solid-forms

## 0.1.0

### Minor Changes

- Production-readiness overhaul: state fixes, submit pipeline, field accessibility, validation improvements, and CI.

  **State fixes**

  - `isFieldValid` now returns `undefined` for unregistered fields instead of `true`
  - `hasBeenValid` computation corrected; initial field errors preserved on first `initializeField`
  - `setFieldValue` preserves existing errors when called without an errors argument (prevents disabled-field server errors being silently cleared)
  - Spurious reactive updates eliminated via shallow array equality on errors

  **Submit pipeline**

  - Double-submit window closed: `isProcessing` is set before the handler is invoked
  - `isProcessing` is always reset via `finally`, even on async handler failure
  - Submit guard fixed: `isProcessing || !haveValuesChanged` now evaluated correctly

  **Field components**

  - Checkbox values are now booleans (`true`/`false`) rather than strings (`'true'`/`'false'`)
  - `CheckboxField` now registers with form state, validates, and participates in changed-state tracking
  - Reactive field props (`value`, `disabled`, `errors`, `checked`, `isInitialized`) exposed through getters instead of mount-time snapshots
  - `createField` no longer mutates JSX element props; component names stored in a shared `WeakMap` registry

  **Accessibility**

  - `InputField`, `TextAreaField`, and `CheckboxField` now render `aria-invalid`, `aria-describedby`, and a `role="alert"` error element when validation errors are displayable

  **Validation**

  - Falsey constraints (`required={false}`, `pattern={undefined}`) are now correctly skipped
  - `pattern` accepts `RegExp` directly; string patterns are compiled once and cached
  - `match` constraint handles uninitialized target fields gracefully
  - Custom `validator` prop is now wired up in `createFormField`; async validators are protected against stale results via a sequencing token

  **Packaging**

  - Internal workspace packages are bundled into `dist/index.js` and stripped from published `dependencies`

  **Developer experience**

  - Full test suite: 90 unit, integration, and component tests across all packages
  - Coverage thresholds enforced per package
  - GitHub Actions CI runs types → lint → test → build on every push and PR
  - Complete API reference and usage docs in `packages/solid-forms/README.md`

## 0.0.11

### Patch Changes

- 05d16fd: Fixes inter-monorepo dependencies
- Fix exports?

## 0.0.10

### Patch Changes

- 05d16fd: Fixes inter-monorepo dependencies

## 0.0.9

### Patch Changes

- Fix types?

## 0.0.8

### Patch Changes

- Fixes some bugs

## 0.0.7

### Patch Changes

- Fix exported types

## 0.0.6

### Patch Changes

- Fix exported types

## 0.0.5

### Patch Changes

- general fixes

## 0.0.4

### Patch Changes

- Adds TS typings

## 0.0.3

### Patch Changes

- fix internal dependencies

## 0.0.2

### Patch Changes

- Update tsconfig settings
- Updated dependencies
  - @gxxc/solid-forms-fields@0.0.1
  - @gxxc/solid-forms-form@0.0.1

## 0.0.1

### Patch Changes

- Generally, most things are working
