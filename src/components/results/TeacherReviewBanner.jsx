import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, ShieldAlert, LogOut, User, Clock, Layers } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function TeacherReviewBanner({
  studentName,
  reviewInfo,
  onVerifyWithKey,
  onExitReview,
}) {
  const { t } = useI18n();
  const [customKey, setCustomKey] = useState('');
  const status = reviewInfo?.verificationStatus;
  const telemetry = reviewInfo?.telemetry;

  const handleVerify = (e) => {
    e.preventDefault();
    if (customKey.trim()) {
      onVerifyWithKey?.(customKey.trim());
    }
  };

  return (
    <div className="bg-action-primary-subtle border border-action-primary-border rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-action-primary text-white flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-action-primary">
                {t('results.teacherReviewBadge')}
              </span>
              {studentName && (
                <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-card border border-border-default text-content-primary">
                  <User className="w-3 h-3 text-content-muted" />
                  <span>{t('results.teacherReviewStudent', { name: studentName })}</span>
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-content-primary mt-0.5">
              {t('results.teacherReviewTitle')}
            </h2>
          </div>
        </div>

        {onExitReview && (
          <button
            type="button"
            onClick={onExitReview}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-content-primary hover:text-state-error bg-surface-card hover:bg-state-error-subtle border border-border-default rounded-xl transition-colors cursor-pointer min-h-[40px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('results.exitTeacherReview')}</span>
          </button>
        )}
      </div>

      {reviewInfo?.assignmentId && (
        <div className="p-3.5 bg-surface-card rounded-2xl border border-border-default space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-content-tertiary">ID: {reviewInfo.assignmentId}</span>
            {status === 'valid' && (
              <span className="flex items-center space-x-1 font-bold text-state-success">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('results.teacherAudit.validSignature')}</span>
              </span>
            )}
            {status === 'invalid' && (
              <span className="flex items-center space-x-1 font-bold text-state-error">
                <ShieldAlert className="w-4 h-4" />
                <span>{t('results.teacherAudit.tamperedSignature')}</span>
              </span>
            )}
            {status === 'unverified' && (
              <form onSubmit={handleVerify} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="LEHRER-XXXX-1234"
                  className="px-2.5 py-1 rounded-lg border border-border-default bg-surface-raised text-xs font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-action-primary text-white font-bold text-xs cursor-pointer"
                >
                  {t('results.teacherAudit.verifyBtn')}
                </button>
              </form>
            )}
          </div>

          {telemetry && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border-default text-content-secondary">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-content-muted" />
                <span>{t('results.teacherAudit.wallTime', { seconds: telemetry.wallClockSeconds })}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-content-muted" />
                <span>
                  {telemetry.tabSwitches > 0
                    ? t('results.teacherAudit.tabSwitches', { count: telemetry.tabSwitches })
                    : t('results.teacherAudit.noTabSwitches')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2 text-xs text-content-secondary border-t border-action-primary-border/40 pt-2.5">
        <ShieldCheck className="w-4 h-4 text-state-success flex-shrink-0" />
        <span>{t('results.teacherReviewNotice')}</span>
      </div>
    </div>
  );
}
