import { test as base, expect } from '@playwright/test';
import { findRawTranslationKeys } from '../support/i18nKeys.js';

/**
 * A page that fails the test on anything a user would see as broken: an uncaught exception,
 * a console error, a failed request, or any call to a backend `/api/*` — the static site must
 * work without one (CLAUDE.md §0).
 */
export const test = base.extend({
  pageProblems: async ({}, use) => {
    await use([]);
  },
  page: async ({ page, pageProblems }, use) => {
    page.on('pageerror', (error) => pageProblems.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') pageProblems.push(`console.error: ${message.text()}`);
    });
    page.on('requestfailed', (request) => {
      if (!isAbortedByNavigation(request)) pageProblems.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`);
    });
    await page.route('**/api/**', (route) => {
      pageProblems.push(`backend call: ${route.request().method()} ${route.request().url()}`);
      return route.abort();
    });
    await use(page);
    expect(pageProblems, 'browser problems during the test').toEqual([]);
  },
});

function isAbortedByNavigation(request) {
  return request.failure()?.errorText === 'net::ERR_ABORTED' && request.resourceType() !== 'fetch';
}

/** The screen rendered real content: a heading and no raw i18n keys. */
export async function expectScreenRendered(page) {
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('h1, h2').first()).toBeVisible();
  const text = await page.locator('body').innerText();
  expect(findRawTranslationKeys(text), 'untranslated i18n keys on screen').toEqual([]);
}

export { expect };
