export const fixtureThemes = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'neobrutalist', label: 'Neobrutalist' }
] as const;

export const fixtureForms = [
  { id: 'login', label: 'Login' },
  { id: 'signup', label: 'Signup' }
] as const;

export type FixtureTheme = (typeof fixtureThemes)[number]['id'];
export type FixtureForm = (typeof fixtureForms)[number]['id'];

export interface FixtureRoute {
  path: `/${FixtureTheme}/${FixtureForm}`;
  theme: FixtureTheme;
  form: FixtureForm;
  heading: string;
}

export const fixtureRoutes = fixtureThemes.flatMap((theme) =>
  fixtureForms.map((form) => ({
    path: `/${theme.id}/${form.id}` as const,
    theme: theme.id,
    form: form.id,
    heading: `${theme.label} ${form.label}`
  }))
);

export const defaultRoute = fixtureRoutes[0];

export function resolveFixtureRoute(pathname: string): FixtureRoute {
  const normalized = pathname.replace(/\/$/, '') || defaultRoute.path;
  return fixtureRoutes.find((route) => route.path === normalized) ?? defaultRoute;
}
