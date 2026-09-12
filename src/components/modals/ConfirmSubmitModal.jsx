import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { Button } from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ConfirmSubmitModal({
  isOpen,
  onClose,
  onConfirm,
  submissionStats = {},
}) {
  const { t } = useI18n();
  const answeredCount = submissionStats.answeredCount ?? 0;
  const totalQuestions = submissionStats.totalQuestions ?? 0;
  const isSubmitting = submissionStats.isSubmitting ?? false;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="w-12 h-12 rounded-2xl bg-state-warning-subtle text-state-warning flex items-center justify-center mb-4 border border-state-warning-border">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-content-primary">
        {t('modals.submitTitle')}
      </h3>

      <p className="text-sm text-content-secondary mt-2 leading-relaxed">
        {t('modals.submitDesc', { answered: answeredCount, total: totalQuestions })}
        {unansweredCount > 0 && (
          <span className="block text-state-warning-text font-medium mt-1">
            {t('modals.submitWarning', { count: unansweredCount })}
          </span>
        )}
      </p>

      <div className="mt-6 flex items-center justify-end space-x-3">
        <Button
          variant="secondary"
          size="default"
          onClick={onClose}
          className="text-xs sm:text-sm font-semibold"
        >
          {t('modals.submitCancel')}
        </Button>
        <Button
          variant="success"
          size="default"
          onClick={onConfirm}
          isLoading={isSubmitting}
          className="text-xs sm:text-sm font-bold shadow-sm"
        >
          {isSubmitting ? t('modals.submitting') : t('modals.submitConfirm')}
        </Button>
      </div>
    </Dialog>
  );
}
