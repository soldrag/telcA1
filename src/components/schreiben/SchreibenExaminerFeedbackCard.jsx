import React, { useMemo } from 'react';
import { ClipboardCheck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { renderExaminerFeedback } from '../../services/schreiben/feedback/examinerFeedbackRenderer.js';

const STATUS_STYLES = {
  positive: { Icon: CheckCircle2, cls: 'text-state-success-text' },
  warning: { Icon: AlertTriangle, cls: 'text-state-warning-text' },
  error: { Icon: XCircle, cls: 'text-state-error-text' },
};

function resolveTitle(language) {
  if (language === 'ru') return 'Отзыв экзаменатора telc';
  return language === 'en' ? 'telc Examiner Feedback' : 'telc Prüfer-Feedback';
}

function FeedbackBullet({ bullet }) {
  const { Icon, cls } = STATUS_STYLES[bullet.status] || STATUS_STYLES.warning;
  return (
    <li className="flex items-start space-x-2">
      <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cls}`} />
      <span className="text-xs text-content-primary leading-relaxed">{bullet.text}</span>
    </li>
  );
}

/**
 * Shows the structured examiner feedback rendered in the current UI language;
 * falls back to the legacy summary string for results without a descriptor.
 */
export default function SchreibenExaminerFeedbackCard({ examinerFeedback, feedbackSummary, language }) {
  const rendered = useMemo(() => renderExaminerFeedback(examinerFeedback, language), [examinerFeedback, language]);
  const summary = rendered?.summary || feedbackSummary;
  if (!summary) return null;

  return (
    <div className="mt-2.5 p-3 rounded-lg border border-state-success-border bg-state-success-subtle/20 space-y-2">
      <div className="text-xs font-black uppercase tracking-wider text-state-success-text flex items-center space-x-1.5">
        <ClipboardCheck className="w-3.5 h-3.5" />
        <span>{resolveTitle(language)}</span>
      </div>
      <p className="text-xs text-content-primary leading-relaxed">{summary}</p>
      {rendered?.bulletPoints.length > 0 && (
        <ul className="space-y-1.5 pt-1 border-t border-state-success-border/50">
          {rendered.bulletPoints.map((b, i) => <FeedbackBullet key={`${b.category}-${i}`} bullet={b} />)}
        </ul>
      )}
    </div>
  );
}
