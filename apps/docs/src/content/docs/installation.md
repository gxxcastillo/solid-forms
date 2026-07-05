---
title: Installation
description: Install solid-forms and import the package styles.
---

Install `@gxxc/solid-forms` into a SolidJS 1.x app.

```bash
npm install @gxxc/solid-forms
# or
pnpm add @gxxc/solid-forms
```

## Styles

The components ship with structural CSS and default design tokens. Import the stylesheet once,
usually in your app entry.

```ts
import '@gxxc/solid-forms/styles.css';
```

That file includes layout, focus behavior, the floating label implementation, and default `--sf-*`
tokens, so forms render as finished UI without a separate theme.

## Theme files

Bundled themes are optional. Import any theme files you plan to activate.

```ts
import '@gxxc/solid-forms/styles.css';
import '@gxxc/solid-forms/themes/midnight.css';
```

Then scope the theme with a `data-sf-theme` attribute or matching class.

```tsx
<div data-sf-theme='midnight'>
  <Form onSubmit={submit}>{/* fields */}</Form>
</div>
```
