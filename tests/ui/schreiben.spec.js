import { test, expect, expectScreenRendered } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerAllParts, confirmSubmit, openSubmitDialog, startVariant } from './support/examFlow.js';
import { fillVisibleSchreibenFields } from './support/schreibenFillers.js';
import { en } from './support/i18nKeys.js';
import { EXAMINER_PHRASES } from '../../src/services/schreiben/feedback/examinerPhraseBank.js';

for (const variant of listVariants('schreiben')) {
  test(`Schreiben ${variant.shortTitle}: fill the form and the letter, submit, see the grading`, async ({ page }) => {
    test.setTimeout(180_000);
    const appHost = new URL(test.info().project.use.baseURL).host;
    const externalHosts = new Set();
    page.on('request', (request) => {
      const { host } = new URL(request.url());
      if (host !== appHost) externalHosts.add(host);
    });
    await openHome(page, { module: 'schreiben' });
    await startVariant(page, variant);
    await expectScreenRendered(page);
    expect(await answerAllParts(page, fillVisibleSchreibenFields)).toBe(variant.totalQuestions);
    await openSubmitDialog(page);
    await confirmSubmit(page);
    await expectScreenRendered(page);
    test.info().annotations.push({ type: 'external hosts', description: [...externalHosts].join(', ') || 'none' });
  });
}

test('Schreiben in the limited mode: the results name the rules-only grading, not the ranker', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => localStorage.setItem('telc_ai_provider_override', 'none'));
  const [variant] = listVariants('schreiben');
  await openHome(page, { module: 'schreiben' });
  await startVariant(page, variant);
  await answerAllParts(page, fillVisibleSchreibenFields);
  await openSubmitDialog(page);
  await confirmSubmit(page);
  const details = page.getByText(en.results.schreibenResult.moreDetails).filter({ visible: true }).first();
  await details.click();
  await expect(page.getByText(en.results.aiLimitedNotice).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText(en.results.aiRankerEvaluated)).toHaveCount(0);
});

// A clean profile has no model: the first submission downloads it, and the dialog says so instead of a bare "Grading...".
test('the first Schreiben submission shows the model download in the submit dialog', async ({ page }) => {
  test.setTimeout(180_000);
  const [variant] = listVariants('schreiben');
  await openHome(page, { module: 'schreiben' });
  await startVariant(page, variant);
  await answerAllParts(page, fillVisibleSchreibenFields);
  await openSubmitDialog(page);
  await page.getByRole('dialog').getByRole('button', { name: en.modals.submitConfirm }).click();
  const [before] = en.modals.modelDownloading.split('{megabytes}');
  await expect(page.getByRole('dialog').getByRole('status')).toContainText(before, { timeout: 30_000 });
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 180_000 });
});

// A fresh worker reads the cached model again on every grading; that read is not a download and is not shown as one.
test('a later Schreiben submission does not report the cached model as a download', async ({ page }) => {
  test.setTimeout(240_000);
  const [variant] = listVariants('schreiben');
  const [before] = en.modals.modelDownloading.split('{megabytes}');
  for (const isFirst of [true, false]) {
    await openHome(page, { module: 'schreiben' }); // clears localStorage only: the model cache stays
    await startVariant(page, variant);
    await answerAllParts(page, fillVisibleSchreibenFields);
    await openSubmitDialog(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: en.modals.submitConfirm }).click();
    let sawDownload = false;
    while (await dialog.isVisible()) {
      sawDownload ||= (await dialog.textContent()).includes(before);
      await page.waitForTimeout(100);
    }
    expect(sawDownload).toBe(isFirst);
  }
});

// The trained another-purpose review runs in the browser on the model the keyword stage loaded. A complaint about a
// course already taken reuses the task's words (Deutschkurs, August) but asks for nothing the task asks for: the
// keyword stage alone credits it, the review voids its Leitpunkte.
const COMPLAINT = `Sehr geehrte Damen und Herren,
ich habe im Juli einen Deutschkurs bei Ihnen gemacht. Der Kurs war leider sehr schlecht. Der Lehrer war oft krank und der Raum war zu klein. Ich möchte mein Geld zurück.
Mit freundlichen Grüßen
Paul Weber`;

test('the another-purpose review voids a letter written for another purpose', async ({ page }) => {
  test.setTimeout(240_000);
  const variant = listVariants('schreiben').find((v) => v.id === 'schreiben-modellsatz-1');
  await openHome(page, { module: 'schreiben' });
  await startVariant(page, variant);
  await answerAllParts(page, async (p) => {
    const filled = await fillVisibleSchreibenFields(p);
    const letter = p.locator('textarea:enabled').filter({ visible: true });
    if (await letter.count()) {
      await letter.first().fill(COMPLAINT);
      await letter.first().blur();
    }
    return filled;
  });
  await openSubmitDialog(page);
  await confirmSubmit(page);
  await expect(page.getByText(EXAMINER_PHRASES.en.SUMMARY_LP_VOID_OFF_TOPIC).first()).toBeVisible();
});
