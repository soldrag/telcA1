import React from 'react';
import { Clock } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { Button } from '../ui/Button.jsx';
import { DIALOG_TITLE } from '../layout/typography.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function TimeUpModal({ isOpen, onConfirm, isGrading = false }) {
  const { t } = useI18n();

  return (
    <Dialog isOpen={isOpen} onClose={onConfirm} maxWidth="max-w-md" labelledBy="time-up-title">
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 bg-state-warning-subtle text-state-warning rounded-full flex items-center justify-center mx-auto border border-state-warning-border">
          <Clock className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 id="time-up-title" className={DIALOG_TITLE}>{t('modals.timeUpTitle')}</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            {t('modals.timeUpDesc')}
          </p>
        </div>
        <Button
          variant="default"
          size="default"
          onClick={onConfirm}
          isLoading={isGrading}
          className="w-full py-3 font-bold text-white bg-action-primary hover:bg-action-primary-hover rounded-xl min-h-[2.75rem]"
        >
          {isGrading ? t('modals.submitting') : t('modals.timeUpConfirm')}
        </Button>
      </div>
    </Dialog>
  );
}
