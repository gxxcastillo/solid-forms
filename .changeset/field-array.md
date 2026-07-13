---
'@gxxc/solid-forms': minor
---

Add field-array support for repeating form sections such as line items and address lists.

`FieldArray` is the high-level row API. Its children receive row-scoped field components, so each row can use local field names while still registering under the correct runtime path (`items.0.title`, `items.1.title`, etc.).

```tsx
function LineItemFields() {
  let itemsArray!: FieldArrayHelpers<{ title: string }>;

  return (
    <>
      <FieldArray<{ title: string }>
        name='items'
        defaultValue={[{ title: '' }]}
        helpersRef={(helpers) => (itemsArray = helpers)}
      >
        {(fields, item, remove) => (
          <>
            <fields.InputField name='title' label='Title' defaultValue={item.title} required />
            <button type='button' onClick={remove}>
              Remove
            </button>
          </>
        )}
      </FieldArray>
      <button type='button' onClick={() => itemsArray.append({ title: '' })}>
        Add line item
      </button>
    </>
  );
}
```

`createScopedFields` is also exported for lower-level composition. It currently provides scoped `InputField` and `PasswordField` components, rewriting row-local `name` and `match` props to the current row path. Custom validators, `showLabel`, and `showIcon` receive a row-local `FormState<Item>`, so sibling reads like `formState.getFieldValue('password')` resolve inside the same row.

`useFieldArray` remains available when callers want to own the row markup and field naming directly:

```tsx
function LineItemFields() {
  const [items, arr] = useFieldArray<{ title: string }>('items', [{ title: '' }]);

  return (
    <For each={items()}>
      {(item, index) => (
        <div>
          <InputField
            name={`items.${index()}.title`}
            label='Title'
            defaultValue={item.defaultValue.title}
          />
          <button type='button' onClick={() => arr.remove(index())}>
            Remove
          </button>
        </div>
      )}
    </For>
  );
}
```

`FieldArray` and `useFieldArray` must be rendered or called from a component inside `<Form>` or `<FormContextProvider>`, like any field.

Removing, inserting, or moving items re-addresses affected fields without remounting their row components. A row's live value, focus, cursor position, touched state, and errors carry over under the new index.

Supporting changes:

- `FormStateMutations` gained `remapFieldNames`, which renames or removes registered fields in one pass.
- `createFormField` now reads `props.name` live when writing values, so shifted rows keep writing to their current path.
- `removeField` now accepts an expected-generation guard so a removed row's cleanup cannot delete a different field that has moved into the same name.
- `FormContextProvider` now forwards `props.children` directly, fixing a re-invocation bug that affected dynamic children such as shrinking field arrays.

Deep-path TypeScript inference for arbitrary nested form paths is still tracked separately. The runtime supports dotted paths today, and `FieldArray` avoids the common row-field typing friction by typing child fields against the row item.
