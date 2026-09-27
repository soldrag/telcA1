import { expect } from '@playwright/test';
import { en } from './i18nKeys.js';
import { visibleButton } from './examFlow.js';

/**
 * @typedef {{ studentName: string, note: string, deadline: string, customMinutes: number }} AssignmentSettings
 */
export const ASSIGNMENT = { studentName: 'Anna Schmidt', note: 'Bitte bis Donnerstag', deadline: '2030-05-16', customMinutes: 30 };

/** From the teacher home: opens «New assignment» and fills every field of the form. */
export async function fillNewAssignment(page, settings = ASSIGNMENT) {
  await visibleButton(page, en.welcome.teacherSpace.newAssignmentBtn).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: en.modals.createAssignment.title })).toBeVisible();
  await dialog.getByLabel(en.modals.createAssignment.variant).selectOption({ index: 1 });
  await dialog.getByRole('button', { name: en.modals.createAssignment.customTime }).click();
  await dialog.getByRole('spinbutton', { name: en.modals.createAssignment.customTime }).fill(String(settings.customMinutes));
  await dialog.getByLabel(en.modals.createAssignment.studentName).fill(settings.studentName);
  await dialog.getByLabel(en.modals.createAssignment.deadline).fill(settings.deadline);
  await dialog.getByLabel(en.modals.createAssignment.note).fill(settings.note);
  return dialog;
}

/** Submits the filled form and returns the signed `#task=` link shown in «Link is ready». */
export async function createAssignmentLink(page) {
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: en.modals.createAssignment.createBtn }).click();
  await expect(dialog.getByRole('heading', { name: en.modals.createAssignment.readyTitle })).toBeVisible();
  const url = await dialog.locator('span[title*="#task="]').getAttribute('title');
  expect(url).toContain('#task=');
  return url;
}

/** Opens a link from scratch, the way a pasted link opens in a new tab. */
export async function openLink(page, url) {
  await page.goto('about:blank');
  await page.goto(url);
}

/** From the assignment landing: starts the exam the teacher set. */
export async function startAssignment(page) {
  await page.getByRole('button', { name: en.assignment.startBtn }).click();
  await expect(page.getByRole('navigation', { name: en.exam.navAriaLabel }).first()).toBeAttached();
}

/** Results of a submitted assignment: the banner with the `#review=` link for the teacher. */
export async function readSubmissionLink(page) {
  const banner = page.getByRole('region', { name: en.results.assignmentSubmissionTitle });
  await expect(banner).toBeVisible({ timeout: 30_000 });
  const link = (await banner.locator('.font-mono').innerText()).trim();
  expect(link).toContain('#review=');
  return link;
}
