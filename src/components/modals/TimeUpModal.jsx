import React from 'react';
import { Clock } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { Button } from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function TimeUpModal({ isOpen, onConfirm }) {
  const { t } = useI18n();

  return (
    <Dialog isOpen={isOpen} onClose={onConfirm} maxWidth="max-w-md">
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 bg-state-warning-subtle text-state-warning rounded-full flex items-center justify-center mx-auto border border-state-warning-border">
          <Clock className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-content-primary">{t('modals.timeUpTitle')}</h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            {t('modals.timeUpDesc')}
          </p>
        </div>
        <Button
          variant="default"
          size="default"
          onClick={onConfirm}
          className="w-full py-3 font-bold text-white bg-action-primary hover:bg-action-primary-hover rounded-xl min-h-[44px]"
        >
          {t('modals.timeUpConfirm')}
        </Button>
      </div>
    </Dialog>
  );
}
