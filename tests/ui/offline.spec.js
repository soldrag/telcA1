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

const readSavedLetter = (page) => page.evaluate(() => {
  const attempts = JSON.parse(localStorage.getItem('telc_exam_attempts_v1') || '[]');
  const letter = attempts[0]?.results?.reviewItems?.find((item) => item.options_json?.type === 'essay');
  return letter ? { mode: letter.grading_mode, fallback: letter.grading_fallback } : null;
});

// The first grading online downloads the model and the ONNX runtime; the service worker and Cache Storage keep them,
// so a later grading without a network is a model grade, not the rules fallback.
test('offline after one online grading: a Schreiben letter is graded by the model', async ({ page }) => {
  test.setTimeout(240_000);
  // The ONNX runtime comes from the app's own files; the model alone is a download, from Hugging Face and its CDN.
  const appHost = new URL(test.info().project.use.baseURL).host;
  const thirdPartyHosts = new Set();
  page.context().on('request', (request) => {
    const { host } = new URL(request.url());
    if (host !== appHost) thirdPartyHosts.add(host);
  });
  const [first, second] = listVariants('schreiben');
  await openHome(page, { module: 'schreiben' });
  await waitForServiceWorker(page);
  await startVariant(page, first);
  await answerAllParts(page, fillVisibleSchreibenFields);
  await openSubmitDialog(page);
  await confirmSubmit(page);
  expect([...thirdPartyHosts].filter((host) => !/(^|\.)(huggingface\.co|hf\.co)$/.test(host))).toEqual([]);
  expect(await readSavedLetter(page)).toEqual({ mode: 'ranker', fallback: null });

  await page.context().setOffline(true);
  await page.reload();
  await page.evaluate(() => { const role = localStorage.getItem('telc_welcome_role'); localStorage.clear(); localStorage.setItem('telc_welcome_role', role); });
  await page.reload();
  await selectModule(page, 'schreiben');
  await startVariant(page, second);
  await answerAllParts(page, fillVisibleSchreibenFields);
  await openSubmitDialog(page);
  await confirmSubmit(page);
  expect(await readSavedLetter(page)).toEqual({ mode: 'ranker', fallback: null });
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
  expect(letter?.provider_id).toBe('micro_ranker');
  expect(letter?.grading_mode).toBe('ranker_without_model');
  expect(typeof letter?.points_earned).toBe('number');

  // The results name the rules fallback with the failure's own message beside the score, details closed.
  expect(letter?.grading_fallback?.reason).toBe('model_failed');
  expect(letter?.grading_fallback?.detail).toBeTruthy();
  await expect(page.getByText(en.results.gradingFallbackModelFailed).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText(/^Reason: /).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText(en.results.aiRankerEvaluated)).toHaveCount(0);

  // The model download fails offline by design; the grade above was made without it.
  const isOfflineModelDownload = (problem) => problem.startsWith('requestfailed: https://huggingface.co/')
    && problem.endsWith('net::ERR_INTERNET_DISCONNECTED');
  pageProblems.splice(0, pageProblems.length, ...pageProblems.filter((problem) => !isOfflineModelDownload(problem)));
});
