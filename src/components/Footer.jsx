import React from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { getVersionSummary, getVersionTooltip } from '../config/version.js';

export default function Footer({ onOpenLegalModal }) {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-border-subtle bg-surface-card py-4 text-center text-xs text-content-tertiary">
      <p>{t('footer.text')}</p>
      <div className="mt-2 flex items-center justify-center space-x-4 text-xs">
        <button
          type="button"
          onClick={() => onOpenLegalModal?.('impressum')}
          className="min-h-[44px] inline-flex items-center px-1 hover:text-content-primary transition-colors underline decoration-border-default hover:decoration-content-primary cursor-pointer"
        >
          {t('footer.impressum') || 'Impressum'}
        </button>
        <span className="opacity-40">•</span>
        <button
          type="button"
          onClick={() => onOpenLegalModal?.('datenschutz')}
          className="min-h-[44px] inline-flex items-center px-1 hover:text-content-primary transition-colors underline decoration-border-default hover:decoration-content-primary cursor-pointer"
        >
          {t('footer.datenschutz') || 'Datenschutzerklärung'}
        </button>
      </div>
      <p className="mt-1.5 opacity-70">{t('footer.privacy')}</p>
      <div
        className="mt-2 inline-block text-[11px] font-mono opacity-40 hover:opacity-90 transition-opacity cursor-default tracking-tight select-all"
        title={getVersionTooltip()}
      >
        {getVersionSummary()}
      </div>
    </footer>
  );
}
