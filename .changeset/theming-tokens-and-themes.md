---
'@gxxc/solid-forms': minor
---

Add a CSS-custom-property theming system and ship three themes.

**Theming**

- Every skinnable value (color, spacing, radius, border, font, shadow, transition) is now a `--sf-*` design token. The structural CSS is unchanged in behaviour but no longer hard-codes any color or size — it reads tokens exclusively. Defaults live in `themes/base.css` and are bundled into `styles.css`, so forms still look finished with no theme applied.
- A theme is just a stylesheet that re-declares tokens under a scope. Because the CSS-module class names stay hashed, consumers skin the library purely through tokens and never have to target internal selectors.
- Ships three importable themes — `minimal` (clean/light), `midnight` (dark), and `neobrutalist` (bold) — activated with a `data-sf-theme="<name>"` attribute (or `sf-theme-<name>` class) on any ancestor. Multiple themes can coexist on a page and be switched at runtime.

**New package exports**

- `@gxxc/solid-forms/styles.css` — structural CSS + default tokens (import once).
- `@gxxc/solid-forms/themes/{base,minimal,midnight,neobrutalist}.css` — the token layer / individual themes.

**Component styling**

- `SubmitButton` is now themed (primary + `approve`/secondary variants, `isFullWidth`), replacing the previously unstyled bare `<button>`.
- `BaseForm` now owns vertical rhythm via `--sf-field-gap`, honours its `align`/`fullWidthButtons`/`className` props, and exposes a stable `sf-form` class hook.
- The native checkbox is themed with `accent-color`.

**Fixes**

- `InputField`'s class list is now applied reactively, so the floating label (`showLabel`) actually floats once the field has a value. It also clears a leading icon. Previously the state class was computed once at render and never updated.
- Corrected the `InputField` root class name (`InputFieldSet` → `InputField`), which had left the container's `display: block` rule unapplied.
