import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog.jsx';
import ShareLinkPanel from '../share/ShareLinkPanel.jsx';
import { buildShareUrl } from '../../services/shareTokenService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

function useShareUrl(attempt, studentName) {
  const [shareUrl, setShareUrl] = useState('');
  useEffect(() => {
    let cancelled = false;
    if (!attempt) return undefined;
    buildShareUrl({ attempt, studentName })
      .then((url) => { if (!cancelled) setShareUrl(url); })
      .catch((err) => console.warn('[ShareAttemptModal] Failed to generate share URL:', err));
    return () => { cancelled = true; };
  }, [attempt, studentName]);
  return shareUrl;
}

/**
 * Student → teacher: the attempt packed into a #review= link, with the student's name.
 */
export default function ShareAttemptModal({ isOpen, attempt, onClose }) {
  const { t } = useI18n();
  const [studentName, setStudentName] = useState('');
  const shareUrl = useShareUrl(isOpen ? attempt : null, studentName);
  if (!attempt) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('modals.shareTitle')} description={t('modals.shareDesc')} maxWidth="max-w-[480px]">
      <div className="space-y-4">
        <div>
          <label htmlFor="student-name-input" className="block text-sm font-semibold text-content-secondary mb-1.5">{t('modals.shareNameLabel')}</label>
          <input
            id="student-name-input"
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder={t('modals.shareNamePlaceholder')}
            maxLength={100}
            autoComplete="name"
            className="w-full min-h-[48px] px-4 rounded-xl bg-surface-card border border-border-default text-content-primary text-base sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
          />
        </div>
        <ShareLinkPanel url={shareUrl} title={t('modals.shareTitle')} />
      </div>
    </Dialog>
  );
}
