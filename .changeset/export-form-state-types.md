---
'@gxxc/solid-forms': minor
---

Export the state types behind `useForm().state` and `useForm().store`, including `FormState`, `FormField`, `FormFields`, `FormStateMutations`, `FormStore`, `FieldValue`, and related error/name types.

Consumers can now name these types directly, for example:

```ts
import type { FormState } from '@gxxc/solid-forms';
```
