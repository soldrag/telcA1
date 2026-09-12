import React from 'react';
import { Info } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

/**
 * Legally aligned, unobtrusive disclaimer reminding users that AI evaluation
 * is advisory and can make mistakes, without replacing official telc examiners.
 */
export default function SchreibenAiDisclaimer() {
  const { t } = useI18n();

  return (
    <div className="pt-2 border-t border-border-subtle flex items-start space-x-1.5 text-[11px] text-content-muted leading-tight">
      <Info className="w-3.5 h-3.5 flex-shrink-0 text-content-muted mt-0.5" aria-hidden="true" />
      <span>{t('results.aiDisclaimer')}</span>
    </div>
  );
}
