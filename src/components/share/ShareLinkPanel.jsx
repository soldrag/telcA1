import React, { lazy, Suspense, useState } from 'react';
import { Copy, Check, Share2, QrCode } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';

const QrCodeImage = lazy(() => import('./QrCodeImage.jsx'));

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';
const PRIMARY = `min-h-[48px] px-4 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${FOCUS_RING}`;
const SECONDARY = `min-h-[48px] px-4 rounded-xl bg-surface-card border border-border-default hover:bg-surface-raised text-content-primary font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${FOCUS_RING}`;

function canUseNativeShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

function CopyButton({ url, className }) {
  const { t } = useI18n();
  const { copied, copy } = useCopyToClipboard();
  return (
    <button type="button" onClick={() => copy(url)} className={className} aria-live="polite">
      {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
      {copied ? t('share.copied') : t('share.copy')}
    </button>
  );
}

// Phones: the system share sheet goes first (Telegram, WhatsApp, mail in one tap), then copy and QR.
function PhoneActions({ url, title, t }) {
  const [showQr, setShowQr] = useState(false);
  const hasShare = canUseNativeShare();
  const share = () => navigator.share({ title, url }).catch(() => {});
  return (
    <div className="sm:hidden space-y-3">
      <div className={`grid gap-2 ${hasShare ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {hasShare && <button type="button" onClick={share} className={PRIMARY}><Share2 className="w-4 h-4" aria-hidden="true" />{t('share.send')}</button>}
        <CopyButton url={url} className={hasShare ? SECONDARY : PRIMARY} />
      </div>
      <button type="button" onClick={() => setShowQr((value) => !value)} aria-expanded={showQr} className={`w-full ${SECONDARY}`}>
        <QrCode className="w-4 h-4" aria-hidden="true" />{showQr ? t('share.hideQr') : t('share.showQr')}
      </button>
      {showQr && <Suspense fallback={null}><div className="flex justify-center"><QrCodeImage value={url} label={t('share.qrAlt')} className="w-56 h-56" /></div></Suspense>}
    </div>
  );
}

function MessengerLinks({ url, t }) {
  const encoded = encodeURIComponent(url);
  const link = `min-h-[44px] px-3 rounded-xl border border-border-default hover:bg-surface-raised text-sm font-semibold text-content-primary inline-flex items-center ${FOCUS_RING}`;
  return (
    <div className="flex flex-wrap gap-2">
      <a href={`https://t.me/share/url?url=${encoded}`} target="_blank" rel="noopener noreferrer" className={link}>{t('share.telegram')}</a>
      <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer" className={link}>{t('share.whatsapp')}</a>
    </div>
  );
}

/**
 * A ready link: one truncated line with Copy, then the ways to hand it over.
 * From 640 px Copy comes first and the QR code is shown straight away.
 */
export default function ShareLinkPanel({ url, title, footnote = null }) {
  const { t } = useI18n();
  if (!url) return <div className="h-12 rounded-xl bg-surface-inset animate-pulse" aria-hidden="true" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl bg-surface-inset border border-border-default p-1.5 pl-3">
        <span className="flex-1 min-w-0 truncate font-mono text-sm text-content-secondary" title={url}>{url.replace(/^https?:\/\//, '')}</span>
        <CopyButton url={url} className={`hidden sm:inline-flex ${PRIMARY} min-h-[44px]`} />
      </div>
      <PhoneActions url={url} title={title} t={t} />
      <div className="hidden sm:flex items-start gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <MessengerLinks url={url} t={t} />
          {footnote}
        </div>
        <Suspense fallback={<div className="w-40 h-40 shrink-0" />}><QrCodeImage value={url} label={t('share.qrAlt')} /></Suspense>
      </div>
      {footnote && <div className="sm:hidden">{footnote}</div>}
    </div>
  );
}
