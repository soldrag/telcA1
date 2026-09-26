import { getTestTypeById } from '../../../../shared/testTypes.js';
import { formatExamName } from '../../../utils/examFormat.js';
import { formatPoints } from '../../../utils/formatPoints.js';

function averageScore(submissions) {
  const scored = submissions.filter((item) => typeof item.score === 'number');
  if (scored.length === 0) return null;
  return Math.round((scored.reduce((sum, item) => sum + item.score, 0) / scored.length) * 2) / 2;
}

function describeStatus(entry, t, language) {
  const submissions = entry.submissions || [];
  const { maxScore, passScore } = getTestTypeById(entry.testType);
  if (submissions.length === 0) return { text: t('welcome.teacherSpace.statusWaiting'), tone: 'muted' };
  if (submissions.length === 1) {
    const { score } = submissions[0];
    if (typeof score !== 'number') return { text: t('welcome.teacherSpace.statusSubmitted'), tone: 'muted' };
    return { text: `${formatPoints(score, language)}/${maxScore}`, tone: score >= passScore ? 'pass' : 'fail' };
  }
  const avg = averageScore(submissions);
  return { text: t('welcome.teacherSpace.statusGroup', { count: submissions.length, avg: avg === null ? '—' : formatPoints(avg, language) }), tone: 'muted' };
}

/**
 * Presentation facts for one issued assignment row: who, which variant, status and the next action.
 */
export function describeIssuedAssignment(entry, t, language) {
  const submissions = entry.submissions || [];
  return {
    student: entry.studentName || submissions[0]?.studentName || t('welcome.teacherSpace.noStudentName'),
    variant: `${getTestTypeById(entry.testType).title} · ${formatExamName(entry.examId)}`,
    status: describeStatus(entry, t, language),
    latestReviewToken: submissions[0]?.reviewToken || null,
  };
}

export const STATUS_TONE_CLASS = {
  muted: 'text-content-secondary',
  pass: 'text-state-success-text font-semibold',
  fail: 'text-state-error-text font-semibold',
};
