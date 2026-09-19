import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { buildShareUrl } from '../../services/shareTokenService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ShareAttemptModal({ isOpen, attempt, onClose }) {
  const { t } = useI18n();
  const [studentName, setStudentName] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!isOpen || !attempt) {
      setShareUrl('');
      return;
    }

    buildShareUrl({ attempt, studentName })
      .then((url) => {
        if (!cancelled) setShareUrl(url);
      })
      .catch((err) => {
        console.warn('[ShareAttemptModal] Failed to generate share URL:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, attempt, studentName]);

  if (!isOpen || !attempt) return null;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-card border border-border-default rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-action-primary-subtle text-action-primary flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-content-primary">{t('modals.shareTitle')}</h3>
              <p className="text-xs text-content-secondary mt-0.5">{t('modals.shareDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-content-muted hover:text-content-primary p-1.5 rounded-xl hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label htmlFor="student-name-input" className="block text-xs font-semibold text-content-secondary">
            {t('modals.shareNameLabel')}
          </label>
          <input
            id="student-name-input"
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder={t('modals.shareNamePlaceholder')}
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-raised border border-border-default text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-action-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-surface-raised rounded-xl border border-border-default text-xs text-content-secondary break-all max-h-24 overflow-y-auto font-mono">
            {shareUrl}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-content-secondary hover:text-content-primary rounded-xl transition-colors min-h-[44px]"
          >
            {t('modals.shareClose')}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all min-h-[44px] cursor-pointer shadow-sm ${
              copied
                ? 'bg-state-success text-white'
                : 'bg-action-primary hover:bg-action-primary-hover text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t('modals.shareCopiedBtn') : t('modals.shareCopyBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
