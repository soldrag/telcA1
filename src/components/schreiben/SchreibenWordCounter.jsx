import React from 'react';
import { Type } from 'lucide-react';
import { NUMERIC } from '../layout/typography.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SchreibenWordCounter({ text = '', targetWords = 30 }) {
  const { t } = useI18n();
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const count = words.length;

  let statusBadge = {
    text: t('exam.schreibenWordCountTooShort') || 'Noch zu kurz',
    className: 'bg-state-warning-subtle text-state-warning-text border-state-warning-border',
  };

  if (count >= 25 && count <= 50) {
    statusBadge = {
      text: t('exam.schreibenWordCountOptimal') || 'Optimale Länge',
      className: 'bg-state-success-subtle text-state-success-text border-state-success-border',
    };
  } else if (count > 50) {
    statusBadge = {
      text: t('exam.schreibenWordCountTooLong') || 'Ausführlich',
      className: 'bg-surface-inset text-content-secondary border-border-default',
    };
  }

  // Inline so it can share one row with the umlaut keys (above the keyboard on phones).
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-content-secondary">
      <Type className="w-4 h-4 text-action-primary shrink-0" aria-hidden="true" />
      <span className={`${NUMERIC} whitespace-nowrap`}>{count} / ~{targetWords}<span className="hidden sm:inline"> Wörter</span></span>
      <span className={`hidden sm:inline px-2.5 py-0.5 rounded-full border text-xs font-semibold ${statusBadge.className}`}>
        {statusBadge.text}
      </span>
    </div>
  );
}
