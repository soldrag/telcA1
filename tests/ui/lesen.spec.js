import { test, expect, expectScreenRendered } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerAllParts, confirmSubmit, openSubmitDialog, startVariant } from './support/examFlow.js';
import { en } from './support/i18nKeys.js';

for (const variant of listVariants('lesen')) {
  test(`Lesen ${variant.shortTitle}: answer every question, submit, review`, async ({ page }) => {
    await openHome(page);
    await startVariant(page, variant);
    await expectScreenRendered(page);
    expect(await answerAllParts(page)).toBe(variant.totalQuestions);
    await openSubmitDialog(page);
    await expect(page.getByRole('dialog')).toContainText(`${variant.totalQuestions} out of ${variant.totalQuestions}`);
    await confirmSubmit(page);
    await expectScreenRendered(page);
  });
}
