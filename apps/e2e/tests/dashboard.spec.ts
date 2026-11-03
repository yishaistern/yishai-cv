import { expect, test } from '@playwright/test';
import { createVersion, openHistory, preview, uniqueName, versionButton } from './fixtures.ts';

test('loads the seeded base CVs and renders the live preview', async ({ page }) => {
  await page.goto('/');

  await expect(versionButton(page, 'Base CV')).toBeVisible();
  await expect(versionButton(page, 'Base CV (Hebrew)')).toBeVisible();
  await expect(preview(page)).toBeVisible();
  await expect(page).toHaveTitle(/CV Studio/);
});

test('edits, saves with a note, and keeps the change after a reload', async ({ page }) => {
  const name = uniqueName('Edit');
  await createVersion(page, name);

  const summary = page.getByRole('textbox', { name: 'Summary' });
  await summary.fill('Builds **fast** web apps.');

  // Dirty state + live preview, before anything is saved.
  await expect(page.getByText('● Unsaved changes')).toBeVisible();
  await expect(page).toHaveTitle(new RegExp(`^● ${name}`));
  await expect(preview(page).locator('.summary')).toHaveText('Builds fast web apps.');
  await expect(preview(page).locator('.summary strong')).toHaveText('fast');

  await page.getByRole('textbox', { name: 'Revision note' }).fill('shorter summary');
  await page.keyboard.press('ControlOrMeta+s');
  await expect(page.getByText('✓ All changes saved')).toBeVisible();

  // Survives a full reload (comes back from SQLite, and localStorage reselects the version).
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Summary' })).toHaveValue('Builds **fast** web apps.');
  const history = await openHistory(page);
  await expect(history.first()).toContainText('shorter summary');
});

test('restores an earlier revision', async ({ page }) => {
  await createVersion(page, uniqueName('Restore'));
  const summary = page.getByRole('textbox', { name: 'Summary' });
  const original = await summary.inputValue();

  await summary.fill('Temporary summary');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('✓ All changes saved')).toBeVisible();

  // History is newest first: [the save, the creation].
  const items = await openHistory(page);
  await expect(items).toHaveCount(2);

  page.once('dialog', (dialog) => dialog.accept());
  await items.nth(1).getByRole('button', { name: 'Restore' }).click();

  await expect(page.getByRole('textbox', { name: 'Summary' })).toHaveValue(original);
  // Restoring remounts the workspace (History collapses again) and adds a revision rather than rewriting history.
  await expect(await openHistory(page)).toHaveCount(3);
});

test('asks before discarding unsaved changes when switching versions', async ({ page }) => {
  const name = uniqueName('Guard');
  await createVersion(page, name);
  await page.getByRole('textbox', { name: 'Summary' }).fill('Not saved yet');

  page.once('dialog', (dialog) => {
    expect(dialog.message()).toContain('unsaved changes');
    return dialog.dismiss();
  });
  await versionButton(page, 'Base CV (Hebrew)').click();

  // Dismissed: still on the same version, edits intact.
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Summary' })).toHaveValue('Not saved yet');
});

test('creates a Hebrew version with a right-to-left preview', async ({ page }) => {
  await createVersion(page, uniqueName('Hebrew'), 'Base CV (Hebrew)');
  await expect(preview(page)).toHaveAttribute('dir', 'rtl');
  await expect(preview(page)).toHaveAttribute('lang', 'he');
});

test('opens the print view in a new tab', async ({ page }) => {
  await createVersion(page, uniqueName('Print'));

  const [printPage] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Print / PDF' }).click(),
  ]);
  await expect(printPage).toHaveURL(/\?print=\d+$/);
  await expect(printPage.locator('.cv-root')).toBeVisible();
  await expect(printPage.getByRole('button', { name: /pdf/i })).toBeVisible();
});

test('deletes a version', async ({ page }) => {
  const name = uniqueName('Delete');
  await createVersion(page, name);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: `Delete version "${name}"` }).click();

  await expect(page.getByText('Version deleted')).toBeVisible();
  await expect(page.getByRole('button', { name: `Delete version "${name}"` })).toHaveCount(0);
});
