import { test, expect } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { listVariants } from './support/seedCatalog.js';
import { answerAllParts, confirmSubmit, openSubmitDialog, startVariant } from './support/examFlow.js';
import { openHistoryScreen } from './support/navigation.js';

const TOLERANCE_PX = 1;
// On top of each project's own viewport: the wide desktop and the tablet between the breakpoints.
const EXTRA_DESKTOP_WIDTHS = [1920, 800];
const [variant] = listVariants('lesen');

const SCREENS = {
  'student home, Lesen': (page) => openHome(page),
  'student home, Schreiben': (page) => openHome(page, { module: 'schreiben' }),
  'teacher home': (page) => openHome(page, { role: 'teacher' }),
  history: async (page) => {
    await openHome(page);
    await openHistoryScreen(page);
  },
  exam: async (page) => {
    await openHome(page);
    await startVariant(page, variant);
  },
  results: async (page) => {
    await openHome(page);
    await startVariant(page, variant);
    await answerAllParts(page);
    await openSubmitDialog(page);
    await confirmSubmit(page);
  },
};

/**
 * Layout faults a user notices: the page scrolls sideways, or a band of the page grid
 * (`<Band data-band>`) has blocks at different heights or off the grid edges from 1024 px.
 * Below 1024 px bands dissolve into the single column (`display: contents`).
 */
function measureLayout(tolerance) {
  const problems = [];
  const off = (a, b) => Math.abs(a - b) > tolerance;
  if (document.documentElement.scrollWidth > window.innerWidth + tolerance) {
    problems.push(`horizontal scroll: ${document.documentElement.scrollWidth} > ${window.innerWidth}`);
  }
  const isDesktop = window.innerWidth >= 1024;
  document.querySelectorAll('[data-band]').forEach((band, index) => {
    const label = `band ${index} (${band.dataset.band})`;
    const { display } = getComputedStyle(band);
    if (!isDesktop) {
      if (display !== 'contents') problems.push(`${label} is ${display} below 1024 px`);
      return;
    }
    const box = band.getBoundingClientRect();
    const blocks = [...band.children].map((child) => child.getBoundingClientRect()).filter((rect) => rect.width > 0);
    if (blocks.length === 0) return;
    if (blocks.some((rect) => off(rect.top, blocks[0].top))) problems.push(`${label}: tops differ`);
    if (band.dataset.band === 'stretch' && blocks.some((rect) => off(rect.bottom, blocks[0].bottom))) problems.push(`${label}: bottoms differ`);
    if (off(Math.min(...blocks.map((rect) => rect.left)), box.left)) problems.push(`${label}: first block leaves the left grid edge`);
    if (off(Math.max(...blocks.map((rect) => rect.right)), box.right)) problems.push(`${label}: last block leaves the right grid edge`);
  });
  return problems;
}

async function expectCleanLayout(page, where) {
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(measureLayout, TOLERANCE_PX), `layout of ${where}`).toEqual([]);
}

for (const [name, open] of Object.entries(SCREENS)) {
  test(`layout, ${name}: no sideways scroll, bands on the grid`, async ({ page, isMobile }) => {
    test.setTimeout(120_000);
    await open(page);
    await expectCleanLayout(page, `${name} at ${page.viewportSize().width} px`);
    if (isMobile) return;
    for (const width of EXTRA_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 1000 });
      await expectCleanLayout(page, `${name} at ${width} px`);
    }
  });
}
