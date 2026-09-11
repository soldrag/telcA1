import React from 'react';
import { Dialog } from './ui/Dialog.jsx';
import { Button } from './ui/Button.jsx';
import HistoryItemCard from './history/HistoryItemCard.jsx';
import HistoryLoadingSkeleton from './history/HistoryLoadingSkeleton.jsx';

export default function HistoryModal({
  isOpen,
  onClose,
  onLoadAttempt,
  attempts = [],
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="История попыток"
      description="Все сохранённые результаты прохождения тестов"
      maxWidth="max-w-xl"
    >
      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 my-2">
        <HistoryModalList
          loading={loading}
          attempts={attempts}
          onLoadAttempt={onLoadAttempt}
          onClose={onClose}
        />
      </div>

      <div className="mt-5 pt-4 border-t border-border-default flex justify-end">
        <Button type="button" variant="secondary" size="default" onClick={onClose} className="min-h-[44px]">
          Закрыть
        </Button>
      </div>
    </Dialog>
  );
}

function HistoryModalList({ loading, attempts, onLoadAttempt, onClose }) {
  if (loading) {
    return <HistoryLoadingSkeleton />;
  }
  if (attempts.length === 0) {
    return (
      <div className="text-center py-10 text-content-secondary text-sm">
        Пока нет сохранённых результатов. Завершите тест, чтобы увидеть здесь свою попытку!
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
