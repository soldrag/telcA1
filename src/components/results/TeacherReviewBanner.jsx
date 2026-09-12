import React from 'react';
import { GraduationCap, ShieldCheck, LogOut, User } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function TeacherReviewBanner({
  studentName,
  onExitReview,
}) {
  const { t } = useI18n();

  return (
    <div className="bg-action-primary-subtle border border-action-primary-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-action-primary text-white flex items-center justify-center flex-shrink-0">
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

      <div className="flex items-center space-x-2 text-xs text-content-secondary border-t border-action-primary-border/40 pt-2.5">
        <ShieldCheck className="w-4 h-4 text-state-success flex-shrink-0" />
        <span>{t('results.teacherReviewNotice')}</span>
      </div>
    </div>
  );
}
