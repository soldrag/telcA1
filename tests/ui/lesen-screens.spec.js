import { test, expect } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerAllParts, answerVisibleQuestions, confirmSubmit, openSubmitDialog, startVariant, visibleButton } from './support/examFlow.js';
import { clickEveryControl } from './support/buttonCrawler.js';
import { en } from './support/i18nKeys.js';

const [variant] = listVariants('lesen');
const PARTS = [1, 2, 3];

async function openPart(page, partNumber) {
  await openHome(page);
  await startVariant(page, variant);
  for (let part = 1; part < partNumber; part += 1) await visibleButton(page, en.exam.navNext).click();
}

async function openResults(page) {
  await openHome(page);
  await startVariant(page, variant);
  await answerAllParts(page);
  await openSubmitDialog(page);
  await confirmSubmit(page);
}

for (const partNumber of PARTS) {
  test(`Lesen exam, part ${partNumber}: every control works`, async ({ page, pageProblems }) => {
    test.setTimeout(240_000);
    await clickEveryControl(page, { restore: () => openPart(page, partNumber), pageProblems });
  });
}

test('Lesen results: every control works', async ({ page, pageProblems }) => {
  test.setTimeout(300_000);
  await clickEveryControl(page, { restore: () => openResults(page), pageProblems });
});

test('Lesen exam: pause, cancel leaving, cancel submitting, then leave', async ({ page }) => {
  await openPart(page, PARTS.at(-1));
  await page.getByRole('button', { name: en.timer.pauseTitle }).filter({ visible: true }).first().click();
  await expect(page.getByText(en.timer.pausedNotice)).toBeVisible();
  await page.getByRole('button', { name: en.timer.resumeTitle }).filter({ visible: true }).first().click();
  await expect(page.getByText(en.timer.pausedNotice)).toBeHidden();

  await openSubmitDialog(page);
  await expect(page.getByRole('dialog')).toContainText(`0 out of ${variant.totalQuestions}`);
  await page.getByRole('dialog').getByRole('button', { name: en.modals.submitCancel }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  // The leave dialog guards answers only: with none given, Exit goes straight home.
  await answerVisibleQuestions(page);
  await page.getByRole('button', { name: en.header.exitExam, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: en.modals.leaveCancel }).click();
  await expect(page.getByRole('navigation', { name: en.exam.navAriaLabel }).first()).toBeAttached();

  await page.getByRole('button', { name: en.header.exitExam, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: en.modals.leaveConfirm }).click();
  await expect(page.getByRole('group', { name: en.welcome.types.selectModule }).filter({ visible: true }).first()).toBeVisible();
});
