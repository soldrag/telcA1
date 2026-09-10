import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { Button } from '../ui/Button.jsx';

export default function ConfirmSubmitModal({
  isOpen,
  onClose,
  onConfirm,
  answeredCount,
  totalQuestions,
  isSubmitting,
}) {
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-slate-900">
        Завершить экзамен telc A1?
      </h3>

      <p className="text-sm text-slate-600 mt-2">
        Вы ответили на <strong className="text-slate-900">{answeredCount}</strong> из{' '}
        <strong className="text-slate-900">{totalQuestions}</strong> вопросов.
        {unansweredCount > 0 && (
          <span className="block text-amber-700 font-medium mt-1">
            Внимание: осталось {unansweredCount} вопросов без ответа! Настоятельно рекомендуется сделать выбор во всех заданиях.
          </span>
        )}
      </p>

      <div className="mt-6 flex items-center justify-end space-x-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="text-xs sm:text-sm font-semibold"
        >
          Вернуться к тесту
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="text-xs sm:text-sm font-bold shadow-sm"
        >
          {isSubmitting ? 'Проверка...' : 'Да, проверить ответы'}
        </Button>
      </div>
    </Dialog>
  );
}
