import React from 'react';
import { Type } from 'lucide-react';
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

  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-inset border border-border-default text-xs font-bold">
      <div className="flex items-center space-x-2 text-content-secondary">
        <Type className="w-4 h-4 text-action-primary" />
        <span>
          {count} / ~{targetWords} Wörter
        </span>
      </div>

      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${statusBadge.className}`}>
        {statusBadge.text}
      </span>
    </div>
  );
}
