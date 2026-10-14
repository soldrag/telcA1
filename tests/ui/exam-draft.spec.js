import { test, expect } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerVisibleQuestions, startVariant } from './support/examFlow.js';
import { en } from './support/i18nKeys.js';

const [variant] = listVariants('lesen');

test('a reload in the middle of an exam keeps the answers and offers to continue', async ({ page }) => {
  await openHome(page);
  await startVariant(page, variant);
  const answered = await answerVisibleQuestions(page);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('telc_exam_draft'))).not.toBeNull();

  await page.reload();
  await expect(page.getByRole('heading', { name: en.welcome.draft.title })).toBeVisible();
  await page.getByRole('button', { name: en.welcome.draft.resume }).click();
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(answered);
});

test('discarding the draft removes it', async ({ page }) => {
  await openHome(page);
  await startVariant(page, variant);
  await answerVisibleQuestions(page);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('telc_exam_draft'))).not.toBeNull();

  await page.reload();
  await page.getByRole('button', { name: en.welcome.draft.discard }).click();
  await expect(page.getByRole('heading', { name: en.welcome.draft.title })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('telc_exam_draft'))).toBeNull();
});
