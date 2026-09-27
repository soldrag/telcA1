import { test, expect, expectScreenRendered } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerAllParts, confirmSubmit, openSubmitDialog, startVariant } from './support/examFlow.js';
import { fillVisibleSchreibenFields } from './support/schreibenFillers.js';

for (const variant of listVariants('schreiben')) {
  test(`Schreiben ${variant.shortTitle}: fill the form and the letter, submit, see the grading`, async ({ page }) => {
    test.setTimeout(180_000);
    const externalHosts = new Set();
    page.on('request', (request) => {
      const { host } = new URL(request.url());
      if (!host.startsWith('telca1.github.io')) externalHosts.add(host);
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
