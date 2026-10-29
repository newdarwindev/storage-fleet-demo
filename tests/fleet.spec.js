import { test, expect } from '@playwright/test';

/** @param {import('@playwright/test').Page} page */
async function selectCandidates(page) {
  await page
    .getByRole('button', { name: 'Select candidates', exact: true })
    .click();
  await expect(page.locator('#selected-size')).toHaveText('42 GB');
  await page.getByRole('button', { name: 'Review cleanup' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Reclaim, without risk.' }),
  ).toBeVisible();
}

/** @param {import('@playwright/test').Page} page */
async function cancelAndEscape(page) {
  await selectCandidates(page);
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    page.getByRole('button', { name: 'Simulate cleanup', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Cancel', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#free')).toHaveText('2.56 TB');
  await expect(page.locator('#preview')).toBeFocused();
  await page.locator('#preview').click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('#preview')).toBeFocused();
  await expect(page.locator('#free')).toHaveText('2.56 TB');
}

test('cleanup preview cancellation, keyboard containment, apply, undo and reset', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#hosts .host')).toHaveCount(8);
  await expect(page.locator('#total')).toHaveText('8.50 TB');
  await expect(page.locator('#files input:disabled')).toHaveCount(2);
  await page.screenshot({
    path: testInfo.outputPath('overview.png'),
    fullPage: true,
  });
  await cancelAndEscape(page);
  await page.locator('#preview').click();
  await page
    .getByRole('button', { name: 'Simulate cleanup', exact: true })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#free')).toHaveText('2.60 TB');
  await expect(page.locator('#files input')).toHaveCount(2);
  await expect(page.locator('#preview')).toBeDisabled();
  await expect(page.locator('#files input:disabled')).toHaveCount(2);
  await page.screenshot({
    path: testInfo.outputPath('cleanup.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Undo last', exact: true }).click();
  await expect(page.locator('#free')).toHaveText('2.56 TB');
  await expect(page.locator('#files input')).toHaveCount(5);
  await expect(page.locator('#undo')).toBeDisabled();
  await selectCandidates(page);
  await page
    .getByRole('button', { name: 'Simulate cleanup', exact: true })
    .click();
  await page.getByRole('button', { name: 'Reset all demo data' }).click();
  await expect(page.locator('#free')).toHaveText('2.56 TB');
  await expect(page.locator('#selected-size')).toHaveText('0 GB');
  await expect(page.locator('#hosts .host')).toHaveCount(8);
});

test('OS filtering, accessible disk navigation, empty folders and reload', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByLabel('Filter operating system').selectOption('macOS');
  await expect(page.locator('#hosts .host')).toHaveCount(2);
  await expect(page.locator('#browser-title')).toContainText('Nova');
  await expect(page.locator('#free')).toHaveText('2.56 TB');
  await page.getByLabel('Filter operating system').selectOption('All systems');
  await page.locator('[data-host="0"]').click();
  const segment = page.locator('#disk-map [data-folder="Caches"]');
  await segment.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#files input')).toHaveCount(1);
  await expect(page.locator('#path')).toContainText('Caches');
  await page.screenshot({
    path: testInfo.outputPath('disk-navigation.png'),
    fullPage: true,
  });
  await selectCandidates(page);
  await page
    .getByRole('button', { name: 'Simulate cleanup', exact: true })
    .click();
  await expect(page.locator('#files')).toContainText('empty');
  await page.reload();
  await expect(page.locator('#hosts .host')).toHaveCount(8);
  await expect(page.locator('#files input')).toHaveCount(5);
  await expect(page.locator('#free')).toHaveText('2.56 TB');
});

test('production app stays local, has no browser errors or horizontal overflow', async ({
  page,
}, testInfo) => {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const external = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('request', (request) => {
    if (new URL(request.url()).hostname !== '127.0.0.1') {
      external.push(request.url());
    }
  });
  await page.goto('/');
  for (const host of [0, 1, 2, 3, 4, 5, 6, 7]) {
    await page.locator(`[data-host="${host}"]`).click();
    await expect(page.locator('#files input')).toHaveCount(5);
    const width = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(width.content).toBeLessThanOrEqual(width.viewport);
  }
  await page.screenshot({
    path: testInfo.outputPath('fleet-tour.png'),
    fullPage: true,
  });
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
