import { test, expect, expectScreenRendered } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerAllParts, confirmSubmit, openSubmitDialog, startVariant } from './support/examFlow.js';
import { fillVisibleSchreibenFields } from './support/schreibenFillers.js';
import { en } from './support/i18nKeys.js';

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
