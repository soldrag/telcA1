import { expect } from '@playwright/test';
import { en } from './i18nKeys.js';
import { ru } from '../../../src/i18n/locales/ru.js';
import { SUPPORTED_LANGUAGES } from '../../../src/i18n/languageDetector.js';
import { visibleButton } from './examFlow.js';

const LOCALE_TEXTS = { en, ru };

/** Every interface language with its translations, as the language switcher offers them. */
export const LOCALES = SUPPORTED_LANGUAGES.map((code) => ({ code, texts: LOCALE_TEXTS[code] }));

export const DIALOG = 'dialog[open]';

/** Opens Settings: the tab bar on phones; from 640 px only a teacher has it in the header (for the key). */
export async function openSettings(page, texts = en) {
  await visibleButton(page, texts.nav.settings).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: texts.settings.title })).toBeVisible();
  return dialog;
}

const LANGUAGE_BUTTON = new RegExp(LOCALES.map(({ texts }) => `^${texts.header.changeLanguage}`).join('|').replace(/[()]/g, '\\$&'));

/**
 * Switches the interface language the way the screen offers it: Settings on phones,
 * the header toggle (next language on each click) from 640 px.
 */
export async function switchLanguage(page, { code, texts }, isMobile) {
  if (isMobile) {
    const settings = await openSettings(page);
    await settings.getByRole('button', { name: texts.languages[code] }).click();
    await settings.getByRole('button', { name: texts.common.close }).click();
  } else {
    for (let step = 0; step < LOCALES.length && (await page.locator('html').getAttribute('lang')) !== code; step += 1) {
      await page.locator('header').getByRole('button', { name: LANGUAGE_BUTTON }).click();
    }
  }
  await expect(page.locator('html')).toHaveAttribute('lang', code);
  await expect(page.getByRole('dialog')).toBeHidden();
}

/** Opens one of the legal texts from the footer. */
export async function openLegal(page, tab) {
  await page.getByRole('button', { name: en.footer[tab] }).filter({ visible: true }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('tab', { name: en.footer[tab] })).toHaveAttribute('aria-selected', 'true');
  return dialog;
}

export async function openHistoryScreen(page, texts = en) {
  await page.getByRole('button', { name: texts.header.history, exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('heading', { name: texts.history.title })).toBeVisible();
}

/** The colour the browser chrome is painted with (`<meta name="theme-color">`). */
export function readThemeColor(page) {
  return page.locator('meta[name="theme-color"]').first().getAttribute('content');
}
