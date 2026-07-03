// Ships the default design tokens with the structural CSS so a bare
// `import '@gxxc/solid-forms/styles.css'` renders a complete, usable form.
// Themes (themes/*.css) only override these variables.
import '../themes/base.css';

export * from '@gxxc/solid-forms-fields';
export * from '@gxxc/solid-forms-form';
