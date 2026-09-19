import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, LogOut, User } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function AssignmentSubmissionBanner({
  studentName = null,
  shareUrl = '',
  onExitAssignment,
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      aria-label={t('results.assignmentSubmissionTitle')}
      className="bg-state-success-subtle/30 border-2 border-state-success-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 animate-fadeIn"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-state-success text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-state-success">
                {t('results.assignmentSubmissionBadge')}
              </span>
              {studentName && (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-card border border-border-default text-content-primary">
                  <User className="w-3 h-3 text-content-muted" />
                  <span>{studentName}</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-content-primary mt-0.5">
              {t('results.assignmentSubmissionTitle')}
            </h2>
          </div>
        </div>

        {onExitAssignment && (
          <button
            type="button"
            onClick={onExitAssignment}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-content-secondary hover:text-content-primary bg-surface-card hover:bg-surface-raised border border-border-default rounded-xl transition-colors cursor-pointer min-h-[40px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('assignment.exitBtn')}</span>
          </button>
        )}
      </div>

      <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
        {t('results.assignmentSubmissionDesc')}
      </p>

      {shareUrl && (
        <div className="space-y-2 pt-1">
          <div className="p-3 bg-surface-card rounded-xl border border-border-default text-xs font-mono text-content-secondary break-all max-h-20 overflow-y-auto select-all">
            {shareUrl}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all min-h-[44px] cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>
              {copied ? t('results.submissionLinkCopied') : t('results.copySubmissionLink')}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
