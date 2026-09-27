import { test, expect, expectScreenRendered } from './fixtures/guardedPage.js';
import { captureStorage, openHome } from './support/appState.js';
import { answerAllParts, openSubmitDialog, visibleButton } from './support/examFlow.js';
import { ASSIGNMENT, createAssignmentLink, fillNewAssignment, openLink, readSubmissionLink, startAssignment } from './support/assignmentFlow.js';
import { clickEveryControl } from './support/buttonCrawler.js';
import { en } from './support/i18nKeys.js';

const DIALOG = 'dialog[open]';

test.beforeEach(async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
});

/** The teacher issues a Lesen assignment; the student, on a clean profile, opens it and submits. */
async function issueAndSubmit(page) {
  await openHome(page, { role: 'teacher' });
  await fillNewAssignment(page);
  const taskUrl = await createAssignmentLink(page);
  const teacherStorage = await captureStorage(page);

  await openHome(page);
  await openLink(page, taskUrl);
  await startAssignment(page);
  await answerAllParts(page);
  await openSubmitDialog(page);
  await page.getByRole('dialog').getByRole('button', { name: en.modals.submitConfirm }).click();
  const reviewUrl = await readSubmissionLink(page);
  return { taskUrl, reviewUrl, teacherStorage, studentStorage: await captureStorage(page) };
}

function issuedRow(page) {
  return page.getByRole('row', { name: new RegExp(ASSIGNMENT.studentName) }).or(
    page.getByRole('listitem').filter({ hasText: ASSIGNMENT.studentName })).filter({ visible: true }).first();
}

test('assignment round trip: issue, complete by link, review by link', async ({ page }) => {
  test.setTimeout(240_000);
  const { taskUrl, reviewUrl, teacherStorage, studentStorage } = await issueAndSubmit(page);

  const banner = page.getByRole('region', { name: en.results.assignmentSubmissionTitle });
  await banner.getByRole('button', { name: en.results.copySubmissionLink }).click();
  await expect(banner.getByRole('button', { name: en.results.submissionLinkCopied })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(reviewUrl);

  // A submitted assignment is locked: the same link shows the result link again, not a new exam.
  await openHome(page, { storage: studentStorage });
  await openLink(page, taskUrl);
  await expect(page.getByRole('heading', { name: en.assignment.alreadySubmittedTitle })).toBeVisible();
  await expect(page.getByText(reviewUrl)).toBeVisible();

  await openHome(page, { role: 'teacher', storage: teacherStorage });
  await expect(issuedRow(page)).toContainText(en.welcome.teacherSpace.statusWaiting);
  await openLink(page, reviewUrl);
  await expect(page.getByRole('heading', { name: en.results.teacherReviewTitle })).toBeVisible();
  await expect(page.getByText(en.results.teacherAudit.validSignature)).toBeVisible();
  await expect(page.getByText(ASSIGNMENT.studentName).first()).toBeVisible();
  await expectScreenRendered(page);

  await page.getByRole('button', { name: en.results.exitTeacherReview }).click();
  await expect(issuedRow(page)).toContainText(/\d\/\d+/);
  await issuedRow(page).getByRole('button', { name: en.welcome.teacherSpace.reviewBtn }).click();
  await expect(page.getByRole('heading', { name: en.results.teacherReviewTitle })).toBeVisible();
});

test('the student sees the teacher’s conditions before starting', async ({ page }) => {
  await openHome(page, { role: 'teacher' });
  await fillNewAssignment(page);
  const taskUrl = await createAssignmentLink(page);
  await openHome(page);
  await openLink(page, taskUrl);
  await expect(page.getByRole('heading', { name: en.assignment.landingTitle })).toBeVisible();
  for (const text of [ASSIGNMENT.studentName, ASSIGNMENT.note, `${ASSIGNMENT.customMinutes} ${en.common.minutesShort}`]) {
    await expect(page.getByText(text)).toBeVisible();
  }
  await startAssignment(page);
});

test('new assignment form: every control works', async ({ page, pageProblems }) => {
  const restore = async () => {
    await openHome(page, { role: 'teacher' });
    await fillNewAssignment(page);
  };
  await clickEveryControl(page, { restore, pageProblems, within: DIALOG, skip: [new RegExp(en.modals.createAssignment.createBtn)] });
});

test('link is ready: every control works, the assignment is listed as issued', async ({ page, pageProblems }) => {
  const restore = async () => {
    await openHome(page, { role: 'teacher' });
    await fillNewAssignment(page);
    await createAssignmentLink(page);
  };
  await clickEveryControl(page, { restore, pageProblems, within: DIALOG });
  await page.getByRole('dialog').getByRole('button', { name: en.common.close }).click();
  await expect(issuedRow(page)).toContainText(en.welcome.teacherSpace.statusWaiting);
  await issuedRow(page).getByRole('button', { name: en.welcome.teacherSpace.linkBtn }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: en.modals.createAssignment.readyTitle })).toBeVisible();
});

test('assignment screens: every control works on the landing, the locked landing and the review', async ({ page, pageProblems }) => {
  test.setTimeout(300_000);
  const { taskUrl, reviewUrl, teacherStorage, studentStorage } = await issueAndSubmit(page);
  const landing = async (storage, heading) => {
    await openHome(page, { storage });
    await openLink(page, taskUrl);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  };
  await clickEveryControl(page, { restore: () => landing({}, en.assignment.landingTitle), pageProblems });
  await clickEveryControl(page, { restore: () => landing(studentStorage, en.assignment.alreadySubmittedTitle), pageProblems });
  await clickEveryControl(page, {
    restore: async () => {
      await openHome(page, { role: 'teacher', storage: teacherStorage });
      await openLink(page, reviewUrl);
      await expect(page.getByRole('heading', { name: en.results.teacherReviewTitle })).toBeVisible();
    },
    pageProblems,
  });
});

test('check a result link: pasting the student’s link opens the review', async ({ page }) => {
  test.setTimeout(180_000);
  const { reviewUrl, teacherStorage } = await issueAndSubmit(page);
  await openHome(page, { role: 'teacher', storage: teacherStorage });
  await visibleButton(page, en.welcome.teacherSpace.checkByLinkBtn).click();
  await page.getByLabel(en.welcome.teacherSpace.quickReviewDesc).fill(reviewUrl);
  await page.getByRole('button', { name: en.welcome.teacherSpace.quickReviewBtn }).click();
  await expect(page.getByRole('heading', { name: en.results.teacherReviewTitle })).toBeVisible();
});
