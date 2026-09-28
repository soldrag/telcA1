import { test, expect, expectScreenRendered } from './fixtures/guardedPage.js';
import { captureStorage, openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerAllParts, confirmSubmit, openSubmitDialog, startVariant } from './support/examFlow.js';
import { clickEveryControl } from './support/buttonCrawler.js';
import { en } from './support/i18nKeys.js';

const VARIANTS = listVariants('lesen').slice(0, 2);

async function completeAttempts(page) {
  for (const variant of VARIANTS) {
    await openHome(page, { storage: await captureStorage(page) });
    await startVariant(page, variant);
    await answerAllParts(page);
    await openSubmitDialog(page);
    await confirmSubmit(page);
  }
  return captureStorage(page);
}

function attemptCards(page) {
  return page.getByRole('button', { name: en.history.shareAttempt }).filter({ visible: true });
}

async function openHistory(page, storage) {
  await openHome(page, { storage });
  await page.getByRole('button', { name: en.header.history, exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('heading', { name: en.history.title })).toBeVisible();
}

test('history: every control works with two attempts saved', async ({ page, pageProblems }) => {
  test.setTimeout(240_000);
  await openHome(page);
  const storage = await completeAttempts(page);
  await openHistory(page, storage);
  await expectScreenRendered(page);
  await expect(attemptCards(page)).toHaveCount(VARIANTS.length);
  await clickEveryControl(page, { restore: () => openHistory(page, storage), pageProblems });
});

test('history: clearing asks first, then leaves the empty state', async ({ page }) => {
  await openHome(page);
  await openHistory(page, await completeAttempts(page));
  const clear = page.getByRole('button', { name: en.history.clearHistory }).filter({ visible: true }).first();
  await clear.click();
  await page.getByRole('button', { name: en.history.clearCancel, exact: true }).click();
  await expect(attemptCards(page)).toHaveCount(VARIANTS.length);
  await clear.click();
  await page.getByRole('button', { name: en.history.clearConfirmBtn }).click();
  await expect(page.getByText(en.history.emptyTitle)).toBeVisible();
  await expectScreenRendered(page);
});
