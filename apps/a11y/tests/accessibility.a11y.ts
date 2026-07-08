import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

type AxeViolation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

const EXPECTED_ROUTES = [
  { path: '/minimal/login', heading: 'Minimal Login' },
  { path: '/minimal/signup', heading: 'Minimal Signup' },
  { path: '/midnight/login', heading: 'Midnight Login' },
  { path: '/midnight/signup', heading: 'Midnight Signup' },
  { path: '/neobrutalist/login', heading: 'Neobrutalist Login' },
  { path: '/neobrutalist/signup', heading: 'Neobrutalist Signup' }
] as const;

function formatViolations(violations: AxeViolation[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => {
          const target = node.target.join(', ');
          const summary = node.failureSummary ? `: ${node.failureSummary}` : '';

          return `  ${target}${summary}`;
        })
        .join('\n');

      return `${violation.id}: ${violation.help}\n${nodes}`;
    })
    .join('\n\n');
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations, formatViolations(results.violations)).toEqual([]);
}

for (const route of EXPECTED_ROUTES) {
  test(`${route.path} has no detectable accessibility violations`, async ({ page }) => {
    await page.goto(route.path);

    await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
    await expect(page.locator('form')).toBeVisible();

    await expectNoAxeViolations(page);
  });
}

test('/minimal/signup invalid blurred state has no detectable accessibility violations', async ({ page }) => {
  await page.goto('/minimal/signup');

  await page.getByLabel('Email').focus();
  await page.getByLabel('Username').fill('ab');
  await page.getByLabel('Password', { exact: true }).fill('short');
  await page.getByLabel('Confirm password').fill('different');
  await page.getByLabel('I accept the terms of service').focus();

  await expect(page.getByText('"Email" is required')).toBeVisible();
  await expect(page.getByText('"Username" is too short')).toBeVisible();
  await expect(page.getByText('"Password" is too short')).toBeVisible();
  await expect(page.getByText('"Confirm password" does not match "Password"')).toBeVisible();

  await expectNoAxeViolations(page);
});

test('/midnight/login invalid blurred state has no detectable accessibility violations', async ({ page }) => {
  await page.goto('/midnight/login');

  await page.getByLabel('Email').focus();
  await page.getByLabel('Password', { exact: true }).fill('short');
  await page.getByLabel('Care to send a message?').focus();

  await expect(page.getByText('"Email" is required')).toBeVisible();
  await expect(page.getByText('"Password" is too short')).toBeVisible();

  await expectNoAxeViolations(page);
});
