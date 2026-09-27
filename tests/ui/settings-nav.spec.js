import { test, expect, expectScreenRendered } from './fixtures/guardedPage.js';
import { openHome } from './support/appState.js';
import { clickEveryControl } from './support/buttonCrawler.js';
import { DIALOG, LOCALES, openHistoryScreen, openLegal, openSettings, readThemeColor, switchLanguage } from './support/navigation.js';
import { en } from './support/i18nKeys.js';

const LEGAL_TABS = ['impressum', 'datenschutz'];

for (const role of ['student', 'teacher']) {
  test(`settings, ${role}: every control works`, async ({ page, pageProblems, isMobile }) => {
    test.skip(role === 'student' && !isMobile, 'from 640 px a student switches language and theme in the header, there is no settings window');
    const restore = async () => {
      await openHome(page, { role });
      await openSettings(page);
    };
    await clickEveryControl(page, { restore, pageProblems, within: DIALOG });
  });
}

for (const tab of LEGAL_TABS) {
  test(`legal notice, ${tab}: every control works`, async ({ page, pageProblems }) => {
    const restore = async () => {
      await openHome(page);
      await openLegal(page, tab);
    };
    await clickEveryControl(page, { restore, pageProblems, within: DIALOG });
  });
}

for (const locale of LOCALES) {
  test(`language ${locale.code}: the main screens are translated`, async ({ page, isMobile }) => {
    const { code, texts } = locale;
    await openHome(page);
    await switchLanguage(page, locale, isMobile);
    await expectScreenRendered(page);
    await expect(page.getByRole('group', { name: texts.welcome.types.selectModule }).filter({ visible: true }).first()).toBeVisible();
    await openHistoryScreen(page, texts);
    await expectScreenRendered(page);

    // The choice outlives a reload.
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', code);
    await expect(page.getByRole('heading', { name: texts.history.title }).or(
      page.getByRole('group', { name: texts.welcome.types.selectModule })).filter({ visible: true }).first()).toBeVisible();
  });
}

// The settings window has the explicit light / dark choice; the header toggle cycles it and is clicked by the home crawl.
test('theme: light and dark repaint the page and the browser chrome', async ({ page }) => {
  await openHome(page, { role: 'teacher' });
  const settings = await openSettings(page);
  await settings.getByRole('button', { name: en.header.themeDark }).click();
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  const darkChrome = await readThemeColor(page);
  await settings.getByRole('button', { name: en.header.themeLight }).click();
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
  expect(await readThemeColor(page)).not.toBe(darkChrome);

  // theme-init.js applies the saved theme before React starts, so a reload does not flash.
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
});

test('teacher key: change, save and copy', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  const newKey = 'LEHRER-TEST-2468';
  await openHome(page, { role: 'teacher' });
  const settings = await openSettings(page);
  await settings.getByRole('button', { name: en.welcome.teacherSpace.changeKeyBtn }).click();
  await settings.getByRole('textbox', { name: en.welcome.teacherSpace.keyCardTitle }).fill(newKey);
  await settings.getByRole('button', { name: en.welcome.teacherSpace.saveKeyBtn }).click();
  await expect(settings.getByText(newKey, { exact: true })).toBeVisible();
  await settings.getByRole('button', { name: en.welcome.teacherSpace.copyKeyBtn }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(newKey);
});

test('phone tab bar: home, history and settings', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the tab bar exists on phones only');
  await openHome(page);
  const tabBar = page.getByRole('navigation', { name: en.nav.tabBar });
  await tabBar.getByRole('button', { name: en.nav.history }).click();
  await expect(page.getByRole('heading', { name: en.history.title })).toBeVisible();
  await expect(tabBar.getByRole('button', { name: en.nav.history })).toHaveAttribute('aria-current', 'page');
  await tabBar.getByRole('button', { name: en.nav.home }).click();
  await expect(page.getByRole('group', { name: en.welcome.types.selectModule }).filter({ visible: true }).first()).toBeVisible();
  await tabBar.getByRole('button', { name: en.nav.settings }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: en.settings.title })).toBeVisible();
});
