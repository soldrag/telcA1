import { test, expect } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerVisibleQuestions, startVariant } from './support/examFlow.js';
import { en } from './support/i18nKeys.js';

const [variant] = listVariants('lesen');
const EXAM_TIME_MS = 25 * 60_000;

test('the time limit ends the exam and shows the results', async ({ page }) => {
  await page.clock.install();
  await openHome(page);
  await startVariant(page, variant);
  await answerVisibleQuestions(page);
  await page.clock.fastForward(EXAM_TIME_MS + 1_000);
  await page.clock.resume();
  // Time-up submits by itself; its dialog stays over the results until the student closes it.
  const viewResults = page.getByRole('button', { name: en.modals.timeUpConfirm });
  await expect(viewResults).toBeEnabled({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: en.header.retake }).filter({ visible: true }).first()).toBeAttached();
  await viewResults.click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: en.header.retake }).filter({ visible: true }).first()).toBeVisible();
});

test('practice without a timer does not run out', async ({ page }) => {
  await page.clock.install();
  await openHome(page);
  await page.getByRole('button', { name: en.welcome.randomCard.practice }).filter({ visible: true }).first().click();
  await page.clock.fastForward(2 * EXAM_TIME_MS);
  await expect(page.getByText(en.modals.timeUpTitle)).toBeHidden();
  await expect(page.getByRole('navigation', { name: en.exam.navAriaLabel }).first()).toBeAttached();
});
