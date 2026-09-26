import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { renderExaminerFeedback } from '../../services/schreiben/feedback/examinerFeedbackRenderer.js';

const STATUS_STYLES = {
  positive: { Icon: CheckCircle2, cls: 'text-state-success-text' },
  warning: { Icon: AlertTriangle, cls: 'text-state-warning-text' },
  error: { Icon: XCircle, cls: 'text-state-error-text' },
};

function FeedbackBullet({ bullet }) {
  const { Icon, cls } = STATUS_STYLES[bullet.status] || STATUS_STYLES.warning;
  return (
    <li className="flex items-start gap-2">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cls}`} aria-hidden="true" />
      <span className="text-sm text-content-primary leading-relaxed">{bullet.text}</span>
    </li>
  );
}

/**
 * The examiner's conclusion on the letter, shown first: summary, then one line per finding.
 * Falls back to the legacy summary string for results without a descriptor.
 */
export default function SchreibenExaminerFeedbackCard({ examinerFeedback, feedbackSummary, language, title }) {
  const rendered = useMemo(() => renderExaminerFeedback(examinerFeedback, language), [examinerFeedback, language]);
  const summary = rendered?.summary || feedbackSummary;
  if (!summary) return null;

  return (
    <div className="rounded-xl bg-surface-inset p-4 space-y-3">
      <h4 className="text-sm font-semibold text-content-secondary">{title}</h4>
      <p className="text-base text-content-primary leading-relaxed">{summary}</p>
      {rendered?.bulletPoints.length > 0 && (
        <ul className="space-y-2">
          {rendered.bulletPoints.map((b, i) => <FeedbackBullet key={`${b.category}-${i}`} bullet={b} />)}
        </ul>
      )}
    </div>
  );
}
