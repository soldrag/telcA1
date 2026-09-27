import { expect } from '@playwright/test';
import { en } from './i18nKeys.js';

const MAX_PARTS = 10;

/** A visible button whose accessible name starts with `label` (desktop appends hotkey hints). */
export function visibleButton(page, label) {
  const name = new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  return page.getByRole('button', { name }).filter({ visible: true }).first();
}

/** From the home screen of the variant's module: starts the timed exam of one variant. */
export async function startVariant(page, variant) {
  await page.getByRole('button', { name: new RegExp(`^${variant.shortTitle}:`) }).filter({ visible: true }).first().click();
  await expect(page.getByRole('navigation', { name: en.exam.navAriaLabel }).first()).toBeAttached();
}

/** Answers every unanswered question on the current part, alternating the option picked. */
export async function answerVisibleQuestions(page) {
  const groups = page.getByRole('radiogroup').filter({ visible: true });
  const count = await groups.count();
  for (let index = 0; index < count; index += 1) {
    const group = groups.nth(index);
    if (await group.locator('[aria-checked="true"]').count()) continue;
    const options = group.getByRole('radio');
    await options.nth(index % (await options.count())).click();
  }
  return count;
}

/** Walks all parts answering every question; returns how many questions were answered. */
export async function answerAllParts(page, answerPart = answerVisibleQuestions) {
  let answered = 0;
  for (let part = 0; part < MAX_PARTS; part += 1) {
    answered += await answerPart(page);
    const next = visibleButton(page, en.exam.navNext);
    if (!(await next.isVisible())) return answered;
    await next.click();
  }
  throw new Error(`more than ${MAX_PARTS} parts — navigation loops`);
}

export async function openSubmitDialog(page) {
  await visibleButton(page, en.exam.navFinish).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

/** Confirms the submit dialog and waits for the results screen. */
export async function confirmSubmit(page) {
  await page.getByRole('dialog').getByRole('button', { name: en.modals.submitConfirm }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: en.header.retake }).filter({ visible: true }).first()).toBeVisible({ timeout: 30_000 });
}
