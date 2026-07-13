---
'@gxxc/solid-forms': minor
---

Add `useFieldArray`, a primitive for repeating form sections (line items, address lists) with `append`/`prepend`/`insert`/`remove`/`move`/`swap`.

```tsx
function LineItemFields() {
  const [items, arr] = useFieldArray<{ title: string }>('items', [{ title: '' }]);

  return (
    <For each={items()}>
      {(item, index) => (
        <div>
          <InputField name={`items.${index()}.title`} label='Title' defaultValue={item.defaultValue.title} />
          <button type='button' onClick={() => arr.remove(index())}>Remove</button>
        </div>
      )}
    </For>
  );
}
```

Like any field, `useFieldArray` must be called from a component rendered *inside* `<Form>`/`<FormContextProvider>` (a child, not the component that itself renders `<Form>`). Field names are plain dotted strings (`items.0.title`) — deep-path TypeScript inference for array/nested field names is not yet implemented (tracked separately); the runtime fully supports it today.

Removing, inserting, or moving items re-addresses every later item's fields (e.g. `items.1.title` → `items.0.title`) without remounting their components — a row's live value, focus, cursor position, and touched/error state all carry over untouched, not just its data. This required two internal fixes that shipped alongside the primitive:

- `FormStateMutations` gained `remapFieldNames`, which renames or removes registered fields in one pass per a caller-supplied function (`null` removes, same name is a no-op, anything else renames in place preserving the field's value/errors/history).
- `createFormField`'s value setter used to capture a field's `name` once at mount and write to that captured name for the component's whole lifetime, even though several read paths in the same file already tracked `props.name` reactively. Writes now read `props.name` live at each commit, matching the reads — a no-op for every existing field (name is always a static string), and required for a `useFieldArray` row to keep writing to wherever it currently lives after a shift.
- `removeField` gained an optional expected-generation guard. Without it, a disposing row's own unmount cleanup (which always targets whatever name it was last rendered with) could delete a *different*, surviving field's data that `remapFieldNames` had just renamed into that same slot moments earlier — the classic "new data moves in before the old owner's cleanup runs" hazard. `createFormField` now tracks and passes its field's last-known generation, so that cleanup call is a no-op whenever the name no longer belongs to the same field.

Also fixes a latent bug in `FormContextProvider`: it called `children(() => props.children)()` inline inside its returned JSX rather than hoisting the `children()` call (the same pattern `BaseForm` already uses correctly). Inlined, the whole expression sat inside the reactive computation the JSX compiler wraps around that child position, so it built a *fresh* `children()` memo — and therefore called `props.children` again — every time that computation re-ran, not just once at setup. This was invisible until now because it only matters when the resolved children contain their own dynamic content whose shape can change, such as a `useFieldArray`-backed `<For>` shrinking: the resulting re-invocation reran the entire wrapped subtree from scratch, discarding whatever reactive state (a field array's item list, a field's live value) it had built up. `FormContextProvider` never actually needed the `children()` helper at all (unlike `BaseForm`, it doesn't inspect/transform children, only forwards them), so it now just forwards `props.children` directly.

Regression coverage: `packages/state/src/fieldPaths.test.ts` (the `shiftFieldArrayIndex` path-remapping helper), `packages/state/src/FormState.test.ts` (`remapFieldNames`, and `removeField`'s new generation guard), `packages/fields/src/hooks/createFormField.test.ts` (the live-name-read fix and the async-validator reattachment case across a rename), `packages/fields/src/hooks/useFieldArray.test.tsx` (append/insert/remove/move/swap against a real `createFormStore`, including that removing an earlier item preserves a later item's live value/errors under its new name), and `packages/fields/src/hooks/useFieldArray.render.test.tsx` (a real DOM/`@solidjs/testing-library` integration test proving a surviving row's actual input element is never remounted and its typed value/focus carry over across a remove). Manually verified end-to-end in a real browser (Playwright against a temporary route on the `apps/a11y` fixture, reverted afterward).
