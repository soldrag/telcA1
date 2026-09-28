import { test, expectScreenRendered } from './fixtures/guardedPage.js';
import { openHome, ACTIVE_MODULES, UPCOMING_MODULES } from './support/appState.js';
import { expect } from '@playwright/test';
import { clickEveryControl } from './support/buttonCrawler.js';
import { en } from './support/i18nKeys.js';

for (const role of ['student', 'teacher']) {
  for (const { id: module } of ACTIVE_MODULES) {
    test(`home, ${role}, ${module}: every control works`, async ({ page, pageProblems }) => {
      const restore = () => openHome(page, { role, module });
      await restore();
      await expectScreenRendered(page);
      const clicked = await clickEveryControl(page, { restore, pageProblems });
      test.info().annotations.push({ type: 'clicked', description: clicked.join(' | ') });
    });
  }
}

test('upcoming modules are shown but cannot be opened', async ({ page }) => {
  await openHome(page);
  const selector = page.getByRole('group', { name: /module/i }).filter({ visible: true }).first();
  for (const { title } of UPCOMING_MODULES) {
    await expect(selector.getByRole('button', { name: title })).toBeDisabled();
  }
});

test('the chosen module stays open after a reload', async ({ page }) => {
  await openHome(page, { module: 'schreiben' });
  await page.reload();
  const { title } = ACTIVE_MODULES.find((type) => type.id === 'schreiben');
  const selector = page.getByRole('group', { name: en.welcome.types.selectModule }).filter({ visible: true }).first();
  await expect(selector.getByRole('button', { name: title })).toHaveAttribute('aria-pressed', 'true');
});
