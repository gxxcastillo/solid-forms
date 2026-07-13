import { For } from 'solid-js';

import { Form, InputField, SubmitButton, useFieldArray } from '@gxxc/solid-forms';

export interface LineItem {
  description: string;
  quantity: string;
}

export interface LineItemsValues {
  items: LineItem[];
}

export interface LineItemsFormProps {
  onSubmit?: (values: LineItemsValues) => void | Promise<void>;
}

const emptyItem: LineItem = { description: '', quantity: '1' };

// useFieldArray reads the form's context (useFormContext), so it must be
// called from a component rendered *inside* <Form>, same as any InputField
// — not from LineItemsForm itself, which renders <Form> as its own child
// and would call useFieldArray before that context exists.
function LineItemFields() {
  const [items, itemsArray] = useFieldArray<LineItem>('items', [emptyItem]);

  return (
    <>
      <For each={items()}>
        {(item, index) => (
          <div>
            <InputField
              name={`items.${index()}.description`}
              label='Description'
              defaultValue={item.defaultValue.description}
              required
            />
            <InputField
              name={`items.${index()}.quantity`}
              label='Quantity'
              defaultValue={item.defaultValue.quantity}
              required
            />
            <button type='button' onClick={() => itemsArray.remove(index())}>
              Remove
            </button>
          </div>
        )}
      </For>
      <button type='button' onClick={() => itemsArray.append({ ...emptyItem })}>
        Add line item
      </button>
    </>
  );
}

export function LineItemsForm(props: LineItemsFormProps) {
  return (
    // Field names inside LineItemFields are plain dotted strings
    // (`items.${index()}.description`), not typed against LineItemsValues —
    // deep-path field-name typing for arrays/nested objects is a known,
    // still-open gap (see strategic-backlog.md T2), so onSubmit's real
    // runtime shape ({ items: [...] }, built by fieldsToProps' nested
    // submit-value construction) has to be asserted here rather than inferred.
    <Form onSubmit={(props.onSubmit ?? (() => undefined)) as (values: object) => void}>
      <LineItemFields />
      <SubmitButton>Submit</SubmitButton>
    </Form>
  );
}
