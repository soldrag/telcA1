import React, { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown } from 'lucide-react';
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

// Phones open on the summary alone, so the criteria below still fit on the first screen.
function startsCollapsed() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(max-width: 639px)').matches);
}

function FindingsToggle({ isOpen, count, label, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={isOpen} className="sm:hidden inline-flex items-center gap-0.5 ml-1 py-2 -my-2 text-action-primary cursor-pointer">
      {label} ({count})
      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
    </button>
  );
}

/**
 * The examiner's conclusion on the letter, shown first: summary, then one line per finding.
 * Falls back to the legacy summary string for results without a descriptor.
 */
export default function SchreibenExaminerFeedbackCard({ examinerFeedback, feedbackSummary, language, title, findingsLabel }) {
  const [isOpen, setOpen] = useState(() => !startsCollapsed());
  const rendered = useMemo(() => renderExaminerFeedback(examinerFeedback, language), [examinerFeedback, language]);
  const summary = rendered?.summary || feedbackSummary;
  if (!summary) return null;

  return (
    <div className="rounded-xl bg-surface-inset p-3 sm:p-4 space-y-2 sm:space-y-3">
      <h4 className="text-sm font-semibold text-content-secondary">{title}</h4>
      <p className="text-[15px] sm:text-base text-content-primary leading-relaxed">
        {summary}
        {rendered?.bulletPoints.length > 0 && (
          <FindingsToggle isOpen={isOpen} count={rendered.bulletPoints.length} label={findingsLabel} onToggle={() => setOpen((value) => !value)} />
        )}
      </p>
      {rendered?.bulletPoints.length > 0 && (
        <ul className={`space-y-2 ${isOpen ? '' : 'max-sm:hidden'}`}>
          {rendered.bulletPoints.map((b, i) => <FeedbackBullet key={`${b.category}-${i}`} bullet={b} />)}
        </ul>
      )}
    </div>
  );
}
