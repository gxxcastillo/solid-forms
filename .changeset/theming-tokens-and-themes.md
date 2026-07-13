---
'@gxxc/solid-forms': minor
---

Add a CSS-custom-property theming system and ship three themes.

**Theming**

- Skinnable values now use `--sf-*` design tokens for color, spacing, radius, borders, fonts, shadows, and transitions.
- Defaults live in `themes/base.css` and are bundled into `styles.css`, so forms still look finished with no explicit theme.
- Themes are plain stylesheets that redeclare tokens under a scope. Consumers can skin forms without targeting hashed internal CSS-module classes.
- Ships three importable themes: `minimal`, `midnight`, and `neobrutalist`. Activate them with `data-sf-theme="<name>"` or `sf-theme-<name>` on any ancestor.

**New package exports**

- `@gxxc/solid-forms/styles.css` — structural CSS + default tokens (import once).
- `@gxxc/solid-forms/themes/{base,minimal,midnight,neobrutalist}.css` — token layers and individual themes.

**Component styling**

- `SubmitButton` is themed, including primary and `approve` variants plus `isFullWidth`.
- `BaseForm` owns vertical rhythm via `--sf-field-gap`, honors `align`, `fullWidthButtons`, and `className`, and exposes a stable `sf-form` class hook.
- The native checkbox is themed with `accent-color`.

**Fixes**

- `InputField` class state is now reactive, so floating labels and leading-icon spacing update as values change.
- Corrected the `InputField` root class name (`InputFieldSet` → `InputField`), which had left the container's `display: block` rule unapplied.
