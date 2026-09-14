import React, { useState } from 'react';
import { Send, Clock, User, AlertCircle, CheckCircle2, Copy, Check, ArrowRight, LogOut } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { formatExamName } from '../../utils/examFormat.js';

export default function AssignmentLandingScreen({
  assignmentData,
  lockoutState,
  onStart,
  onExit,
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!assignmentData) return null;

  const isSubmitted = lockoutState?.status === 'submitted';
  const shareUrl = lockoutState?.shareUrl;

  const handleCopyShare = async () => {
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

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 animate-fadeIn">
        <div className="bg-surface-card border border-border-default rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-state-success-subtle text-state-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-content-primary">
              {t('assignment.alreadySubmittedTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary">
              {t('assignment.alreadySubmittedDesc')}
            </p>
          </div>

          {shareUrl && (
            <div className="space-y-2 text-left">
              <span className="text-xs font-semibold text-content-secondary">
                {t('assignment.copyResultBtn')}:
              </span>
              <div className="p-3 bg-surface-raised rounded-xl border border-border-default text-xs text-content-secondary font-mono break-all max-h-20 overflow-y-auto">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyShare}
                className="w-full py-2.5 px-4 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all min-h-[44px] cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t('modals.shareCopiedBtn') : t('modals.shareCopyBtn')}</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onExit}
            className="w-full py-2.5 px-4 rounded-xl border border-border-default hover:bg-surface-raised text-content-secondary font-semibold text-xs transition-colors min-h-[44px] cursor-pointer"
          >
            {t('assignment.exitBtn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-fadeIn">
      <div className="bg-surface-card border border-border-default rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-action-primary text-white flex items-center justify-center shrink-0 shadow-md">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-action-primary">
              telc A1 Hausaufgabe
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-content-primary">
              {t('assignment.landingTitle')}
            </h2>
          </div>
        </div>

        <div className="bg-surface-raised rounded-2xl p-4 border border-border-default space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center py-1 border-b border-border-default">
            <span className="text-content-secondary">{t('assignment.variantLabel')}</span>
            <span className="font-bold text-content-primary">
              {formatExamName(assignmentData.examId)} ({assignmentData.testType.toUpperCase()})
            </span>
          </div>

          {assignmentData.studentName && (
            <div className="flex justify-between items-center py-1 border-b border-border-default">
              <span className="text-content-secondary flex items-center space-x-1">
                <User className="w-3.5 h-3.5" />
                <span>{t('assignment.assignedToLabel')}</span>
              </span>
              <span className="font-bold text-content-primary">{assignmentData.studentName}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1 border-b border-border-default">
            <span className="text-content-secondary flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('assignment.timeLimitLabel')}:</span>
            </span>
            <span className="font-bold text-content-primary">
              {assignmentData.timeLimitSeconds > 0
                ? `${Math.round(assignmentData.timeLimitSeconds / 60)} ${t('common.minutesShort')}`
                : t('modals.createAssignment.noTimer')}
            </span>
          </div>

          {assignmentData.note && (
            <div className="pt-1">
              <span className="text-content-secondary block text-[11px] mb-0.5">{t('assignment.noteLabel')}:</span>
              <p className="text-content-primary font-medium italic bg-surface-card p-2.5 rounded-xl border border-border-default">
                «{assignmentData.note}»
              </p>
            </div>
          )}
        </div>

        <div className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-action-primary-subtle text-content-primary text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 text-action-primary shrink-0 mt-0.5" />
          <span>{t('assignment.rulesNotice')}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onExit}
            className="flex-1 py-3 px-4 rounded-xl border border-border-default hover:bg-surface-raised text-content-secondary font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('assignment.exitBtn')}</span>
          </button>

          <button
            type="button"
            onClick={onStart}
            className="flex-2 py-3 px-6 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer shadow-md"
          >
            <span>{t('assignment.startBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
