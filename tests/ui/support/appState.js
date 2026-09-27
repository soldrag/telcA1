import { en } from './i18nKeys.js';
import { TEST_TYPES } from '../../../shared/testTypes.js';

export const ACTIVE_MODULES = TEST_TYPES.filter((type) => type.status === 'active');
export const UPCOMING_MODULES = TEST_TYPES.filter((type) => type.status !== 'active');

/**
 * Opens the home screen from a clean profile: empty storage, then only what the test asks for.
 * @param {import('@playwright/test').Page} page
 * @param {{ role?: 'student'|'teacher', module?: string, storage?: Record<string,string> }} [state]
 */
export async function openHome(page, { role = 'student', module = 'lesen', storage = {} } = {}) {
  await page.goto('./');
  await page.evaluate((entries) => {
    localStorage.clear();
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, { telc_welcome_role: role, ...storage });
  await page.reload();
  if (module !== 'lesen') await selectModule(page, module);
}

export async function selectModule(page, moduleId) {
  const { title } = TEST_TYPES.find((type) => type.id === moduleId);
  const selector = page.getByRole('group', { name: en.welcome.types.selectModule }).filter({ visible: true }).first();
  await selector.getByRole('button', { name: title }).click();
}
