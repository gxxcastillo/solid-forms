---
'@gxxc/solid-forms': patch
---

Fix two `InputField` floating-label (`showLabel`) bugs:

- The label overlapped the input's top border once the field had a value, in themes with a thicker `--sf-border-width` (e.g. `neobrutalist`'s 3px). The label's lift was a fixed rem offset that didn't account for border thickness, so it cleared a 1px border but overlapped a 3px one. The offset now compensates for `--sf-border-width`, keeping consistent clearance across themes.
- The extra top padding meant to make room for the floated label was applied whenever `showLabel` was on, even while the field was still empty and showing its plain placeholder (no floated label yet) — pushing that placeholder text down off-center for no reason. The padding is now scoped to only apply once the label has actually floated up (i.e. the field has a value).
