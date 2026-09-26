import React from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { getVersionSummary, getVersionTooltip } from '../config/version.js';
import { PAGE_CONTAINER } from './layout/pageLayout.js';

const LINK_CLASS = 'min-h-[2.75rem] inline-flex items-center px-1 hover:text-content-primary transition-colors underline decoration-border-default hover:decoration-content-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';

/**
 * One quiet line on desktop (name · legal links · privacy note, version on the right), two lines on phones.
 * Same canvas as the page, so it closes the page instead of starting a new panel.
 */
export default function Footer({ onOpenLegalModal }) {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-border-subtle bg-bg-canvas text-xs text-content-tertiary">
      <div className={`${PAGE_CONTAINER} py-2 flex flex-col lg:flex-row items-center lg:justify-between gap-x-6 text-center lg:text-left`}>
        <p className="flex flex-wrap items-center justify-center gap-x-3">
          <span className="max-lg:order-2 max-lg:basis-full">{t('footer.text')}</span>
          <span aria-hidden="true" className="max-lg:hidden">·</span>
          <button type="button" onClick={() => onOpenLegalModal?.('impressum')} className={LINK_CLASS}>{t('footer.impressum')}</button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => onOpenLegalModal?.('datenschutz')} className={LINK_CLASS}>{t('footer.datenschutz')}</button>
          <span aria-hidden="true" className="max-lg:hidden">·</span>
          <span className="max-lg:order-3 max-lg:basis-full">{t('footer.privacy')}</span>
        </p>
        <span className="font-mono tabular-nums cursor-default select-all" title={getVersionTooltip()}>{getVersionSummary()}</span>
      </div>
    </footer>
  );
}
