import { expect, type Page } from '@playwright/test';

/** Every test works on its own version, so tests can run in parallel against one server. */
export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** The scaled-down live CV on the right. */
export const preview = (page: Page) => page.locator('.preview-page .cv-root');

/** The sidebar entry that selects a version (not its ⧉ / × buttons, whose labels also contain the name). */
export function versionButton(page: Page, name: string) {
  return page
    .locator('.version-item__main')
    .filter({ has: page.locator('.version-item__name').getByText(name, { exact: true }) });
}

/** Opens the dashboard and creates a new version from a base CV through the sidebar form. */
export async function createVersion(
  page: Page,
  name: string,
  startFrom: 'Base CV (English)' | 'Base CV (Hebrew)' = 'Base CV (English)',
) {
  await page.goto('/');
  await expect(versionButton(page, 'Base CV')).toBeVisible();

  await page.getByRole('button', { name: '+ New' }).click();
  const form = page.locator('form.new-version');
  await form.getByRole('textbox', { name: 'Name *' }).fill(name);
  await form.getByRole('textbox', { name: 'Target company' }).fill('Acme');
  await form.getByRole('radio', { name: startFrom }).check();
  await form.getByRole('button', { name: 'Create', exact: true }).click();

  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await expect(page.getByText('✓ All changes saved')).toBeVisible();
}

/** The History panel is collapsed by default. */
export async function openHistory(page: Page) {
  await page.getByRole('button', { name: /^History/ }).click();
  return page.locator('.history-item');
}
