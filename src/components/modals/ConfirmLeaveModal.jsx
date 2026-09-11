import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { Button } from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ConfirmLeaveModal({ isOpen, onClose, onConfirm }) {
  const { t } = useI18n();

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="w-12 h-12 rounded-2xl bg-state-error-subtle text-state-error flex items-center justify-center mb-4 border border-state-error-border">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-content-primary">
        {t('modals.leaveTitle')}
      </h3>
      <p className="text-sm text-content-secondary mt-2 leading-relaxed">
        {t('modals.leaveDesc')}
      </p>

      <div className="mt-6 flex items-center justify-end space-x-3">
        <Button
          variant="secondary"
          size="default"
          onClick={onClose}
          className="text-xs sm:text-sm font-semibold"
        >
          {t('modals.leaveCancel')}
        </Button>
        <Button
          variant="destructive"
          size="default"
          onClick={onConfirm}
          className="text-xs sm:text-sm font-bold shadow-sm"
        >
          {t('modals.leaveConfirm')}
        </Button>
      </div>
    </Dialog>
  );
}
