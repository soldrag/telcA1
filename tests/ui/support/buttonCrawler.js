import { expect } from '@playwright/test';
import { findRawTranslationKeys } from './i18nKeys.js';

const CLICKABLE = 'button, a[href], [role="button"], [role="tab"], [role="radio"], [role="switch"], [role="checkbox"], summary';
const SETTLE_MS = 150;

/**
 * Clicks every visible, enabled control of one screen, each from a freshly restored screen,
 * and reports which click broke the page. Destructive actions (submit, clear, leave) are listed
 * in `skip` and exercised by the flow specs instead; links to other sites are checked, not opened.
 *
 * `within` narrows the crawl to one part of the screen, e.g. an open dialog (the page behind it is inert).
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ restore: () => Promise<void>, pageProblems: string[], skip?: RegExp[], within?: string }} options
 * @returns {Promise<string[]>} labels of the controls clicked
 */
export async function clickEveryControl(page, { restore, pageProblems, skip = [], within = 'body' }) {
  await restore();
  const controls = await listControls(page.locator(within));
  const clicked = [];
  const broken = [];
  for (const control of controls) {
    if (control.external) {
      expect(control.href, `link "${control.label}"`).toMatch(/^(https?:|mailto:)/);
      continue;
    }
    if (skip.some((pattern) => pattern.test(control.label))) continue;
    await restore();
    const problems = await clickAndInspect(page, { control, within }, pageProblems);
    if (problems.length) broken.push(`"${control.label}": ${problems.join('; ')}`);
    clicked.push(control.label);
  }
  expect(broken, 'controls that broke the page').toEqual([]);
  return clicked;
}

async function clickAndInspect(page, { control, within }, pageProblems) {
  const before = pageProblems.length;
  const target = page.locator(within).locator(CLICKABLE).nth(control.index);
  const label = await target.evaluate(describeLabel).catch(() => null);
  if (label !== control.label) return [`control moved (found "${label}")`];
  await target.click({ timeout: 5_000 }).catch((error) => pageProblems.push(`click failed: ${error.message.split('\n')[0]}`));
  await page.waitForTimeout(SETTLE_MS);
  const problems = pageProblems.splice(before);
  const text = await page.locator('body').innerText();
  if (!text.trim()) problems.push('blank page');
  problems.push(...findRawTranslationKeys(text).map((key) => `raw i18n key ${key}`));
  return problems;
}

async function listControls(root) {
  return root.locator(CLICKABLE).evaluateAll((elements, describe) => {
    const labelOf = new Function(`return (${describe})`)();
    return elements
      .map((element, index) => ({ element, index }))
      .filter(({ element }) => element.checkVisibility() && !element.disabled && element.getAttribute('aria-disabled') !== 'true')
      .map(({ element, index }) => ({
        index,
        label: labelOf(element),
        href: element.getAttribute('href'),
        external: element.tagName === 'A' && (element.target === '_blank' || new URL(element.href, location.href).origin !== location.origin),
      }));
  }, describeLabel.toString());
}

function describeLabel(element) {
  const name = element.getAttribute('aria-label') || element.innerText || element.getAttribute('title') || element.getAttribute('href') || '';
  return `${element.tagName.toLowerCase()}:${name.replace(/\s+/g, ' ').trim().slice(0, 60)}`;
}
