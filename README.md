# solid-forms

Typed, reactive forms for SolidJS.

**Demo:** https://gxxcastillo.github.io/solid-forms/

**User docs:** [`packages/solid-forms/README.md`](packages/solid-forms/README.md)

---

## Development

### Setup

Requires Node 22 and pnpm 9. With [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use          # reads .nvmrc → Node 22.12.0
pnpm install
```

### Common tasks

```bash
pnpm moon :build    # build all packages
pnpm moon :test     # run all tests
pnpm moon :types    # typecheck all packages
pnpm moon :lint     # lint all packages

# target a single project
pnpm moon solid-forms-state:test
pnpm moon docs:dev
```

### Run the docs site (includes the live demo)

```bash
pnpm moon docs:dev
```

---

## Contributing

### Changesets

Add a changeset with every PR that touches a published package:

```bash
pnpm changeset
```

### Release workflow

```bash
pnpm bump          # bump package versions based on changesets
pnpm run publish   # build, pack, and publish @gxxc/solid-forms
```

pnpm uses `publishConfig.exports` in `packages/solid-forms/package.json` to strip the `development` export condition from the published tarball. Internal workspace packages are listed only in `devDependencies` and are bundled into `dist/index.js` at build time, so they do not appear as runtime dependencies.

---

## Monorepo structure

| Path | Package | Description |
|------|---------|-------------|
| `packages/solid-forms` | `@gxxc/solid-forms` | Public facade — re-exports the full API |
| `packages/state` | `@gxxc/solid-forms-state` | Form store, context, and field mutations |
| `packages/form` | `@gxxc/solid-forms-form` | `Form`, `useForm`, submit pipeline |
| `packages/fields` | `@gxxc/solid-forms-fields` | `InputField`, `PasswordField`, `TextAreaField`, `CheckboxField`, `SubmitButton` |
| `packages/elements` | `@gxxc/solid-forms-elements` | Primitive DOM wrappers |
| `packages/validation` | `@gxxc/solid-forms-validation` | Built-in constraint validation |
| `packages/examples` | — | Standalone example components |
| `apps/docs` | — | Astro docs site with live demo |
