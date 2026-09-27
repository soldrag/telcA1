import { test, expect, expectScreenRendered } from './fixtures/guardedPage.js';
import { openHome, selectModule } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerAllParts, confirmSubmit, openSubmitDialog, startVariant } from './support/examFlow.js';
import { en } from './support/i18nKeys.js';
import { fillVisibleSchreibenFields } from './support/schreibenFillers.js';

const [variant] = listVariants('lesen');
const [schreibenVariant] = listVariants('schreiben');

test.use({ serviceWorkers: 'allow' });

/** The service worker from the first visit controls the page, so the next load can come from its cache. */
async function waitForServiceWorker(page) {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
}

test('offline after the first visit: the app opens and a Lesen exam is taken and graded', async ({ page }) => {
  test.setTimeout(120_000);
  await openHome(page);
  await waitForServiceWorker(page);

  await page.context().setOffline(true);
  await page.reload();
  await expectScreenRendered(page);
  await expect(page.getByText(en.header.offlineBadge).filter({ visible: true }).first()).toBeVisible();

  await startVariant(page, variant);
  await answerAllParts(page);
  await openSubmitDialog(page);
  await confirmSubmit(page);
  await expectScreenRendered(page);
});

// The letter is graded at submission by the Micro-Ranker; offline without a downloaded model the
// submission must still finish and save a grade instead of waiting for the network.
test('offline after the first visit: a Schreiben letter is submitted and graded without the model', async ({ page, pageProblems }) => {
  test.setTimeout(120_000);
  await openHome(page);
  await waitForServiceWorker(page);

  await page.context().setOffline(true);
  await page.reload();
  await selectModule(page, 'schreiben');
  await startVariant(page, schreibenVariant);
  await answerAllParts(page, fillVisibleSchreibenFields);
  await openSubmitDialog(page);
  await confirmSubmit(page);
  await expectScreenRendered(page);

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('telc_exam_attempts_v1') || '[]'));
  const letter = saved[0]?.results?.reviewItems?.find((item) => item.options_json?.type === 'essay');
  expect(letter?.provider_id).toBeTruthy();
  expect(typeof letter?.points_earned).toBe('number');

  // The model download fails offline by design; the grade above was made without it.
  const isOfflineModelDownload = (problem) => problem.startsWith('requestfailed: https://huggingface.co/')
    && problem.endsWith('net::ERR_INTERNET_DISCONNECTED');
  pageProblems.splice(0, pageProblems.length, ...pageProblems.filter((problem) => !isOfflineModelDownload(problem)));
});
