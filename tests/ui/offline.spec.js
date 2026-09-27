import { test, expect, expectScreenRendered } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerAllParts, confirmSubmit, openSubmitDialog, startVariant } from './support/examFlow.js';
import { en } from './support/i18nKeys.js';

const [variant] = listVariants('lesen');

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
