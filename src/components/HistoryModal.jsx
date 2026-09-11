import React from 'react';
import { Dialog } from './ui/Dialog.jsx';
import { Button } from './ui/Button.jsx';
import HistoryItemCard from './history/HistoryItemCard.jsx';
import HistoryLoadingSkeleton from './history/HistoryLoadingSkeleton.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function HistoryModal({
  isOpen,
  onClose,
  onLoadAttempt,
  attempts = [],
  loading = false,
}) {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('history.title')}
      description={t('history.modalDescription')}
      maxWidth="max-w-xl"
    >
      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 my-2">
        <HistoryModalList
          loading={loading}
          attempts={attempts}
          onLoadAttempt={onLoadAttempt}
          onClose={onClose}
          t={t}
        />
      </div>

      <div className="mt-5 pt-4 border-t border-border-default flex justify-end">
        <Button type="button" variant="secondary" size="default" onClick={onClose} className="min-h-[44px]">
          {t('common.close')}
        </Button>
      </div>
    </Dialog>
  );
}

function HistoryModalList({ loading, attempts, onLoadAttempt, onClose, t }) {
  if (loading) {
    return <HistoryLoadingSkeleton />;
  }
  if (attempts.length === 0) {
    return (
      <div className="text-center py-10 text-content-secondary text-sm">
        {t('history.emptyHistory')}
      </div>
    );
  }
  return attempts.map((attempt) => (
    <HistoryItemCard
      key={attempt.id}
      attempt={attempt}
      onSelect={(selectedId) => {
        onLoadAttempt(selectedId);
        onClose();
      }}
      compact
    />
  ));
}
