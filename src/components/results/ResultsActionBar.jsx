import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';
const PRIMARY = `min-h-[52px] px-5 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-semibold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${FOCUS_RING}`;
const SECONDARY = `min-h-[52px] px-5 rounded-xl bg-surface-card border border-border-default hover:bg-surface-raised text-content-primary font-semibold whitespace-nowrap cursor-pointer transition-colors ${FOCUS_RING}`;
const LINK = `min-h-[44px] px-1 text-sm text-action-primary hover:text-action-primary-hover cursor-pointer ${FOCUS_RING}`;

function CopySubmissionButton({ shareUrl, t }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator?.clipboard?.writeText?.(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" onClick={handleCopy} className={PRIMARY}>
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? t('results.submissionLinkCopied') : t('results.copySubmissionLink')}
    </button>
  );
}

function StudentActions({ mistakesCount, onRetakeMistakes, onResetExam, onShareResult, onOpenHistory, t }) {
  const hasMistakes = mistakesCount > 0 && onRetakeMistakes;
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {hasMistakes ? (
          <button type="button" onClick={onRetakeMistakes} className={PRIMARY}>{t('results.reviewMistakes', { count: mistakesCount })}</button>
        ) : (
          onResetExam && <button type="button" onClick={onResetExam} className={PRIMARY}>{t('results.retakeExam')}</button>
        )}
        {onShareResult && <button type="button" onClick={onShareResult} className={SECONDARY}>{t('results.shareResult')}</button>}
      </div>
      <div className="flex flex-wrap gap-x-5">
        {hasMistakes && onResetExam && <button type="button" onClick={onResetExam} className={LINK}>{t('results.retakeExam')}</button>}
        {onOpenHistory && <button type="button" onClick={onOpenHistory} className={LINK}>{t('results.viewHistory')}</button>}
      </div>
    </div>
  );
}

/**
 * Main result actions: one primary step (work on mistakes, or retake), sending to the teacher, and quieter links.
 */
export default function ResultsActionBar({ isTeacherReview = false, isAssignment = false, shareSubmissionUrl = null, ...actions }) {
  const { t } = useI18n();
  if (isTeacherReview) return null;
  if (isAssignment) return shareSubmissionUrl ? <CopySubmissionButton shareUrl={shareSubmissionUrl} t={t} /> : null;
  return <StudentActions {...actions} t={t} />;
}
