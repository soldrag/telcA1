import React, { useMemo } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { formatExamName } from '../../../utils/examFormat.js';
import { resolveDraftTimer } from '../../../utils/examDraft.js';
import Section from '../../layout/Section.jsx';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';

/** The exam that a reload interrupted: continue where it stopped, or drop it. Renders nothing without a draft. */
export default function ExamDraftCard({ draft, onResume, onDiscard }) {
  const { t } = useI18n();
  const timer = useMemo(() => (draft ? resolveDraftTimer(draft) : null), [draft]);
  if (!draft) return null;

  const name = formatExamName(draft.examId);
  const answered = Object.keys(draft.answers).length;
  const minutes = Math.ceil(timer.secondsLeft / 60);
  const summaryKey = timer.isTimed ? 'welcome.draft.summaryTimed' : 'welcome.draft.summaryPractice';

  return (
    <Section id="exam-draft-title" title={t('welcome.draft.title')}>
      <p className="text-sm text-content-secondary">{t(summaryKey, { name, answered, minutes })}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onResume}
          className={`min-h-[3.25rem] px-6 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-semibold cursor-pointer transition-colors ${FOCUS_RING}`}
        >
          {t('welcome.draft.resume')}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className={`min-h-[3.25rem] px-6 rounded-xl bg-surface-card border border-border-default hover:bg-surface-raised text-content-primary font-semibold cursor-pointer transition-colors ${FOCUS_RING}`}
        >
          {t('welcome.draft.discard')}
        </button>
      </div>
    </Section>
  );
}
