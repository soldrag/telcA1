import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { Button } from '../ui/Button.jsx';

export default function ConfirmLeaveModal({ isOpen, onClose, onConfirm }) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-slate-900">
        Прервать текущий экзамен?
      </h3>
      <p className="text-sm text-slate-600 mt-2">
        Ваши текущие ответы не будут сохранены в историю, если вы выйдете в главное меню сейчас.
      </p>

      <div className="mt-6 flex items-center justify-end space-x-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="text-xs sm:text-sm font-semibold"
        >
          Продолжить экзамен
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          className="text-xs sm:text-sm font-bold shadow-sm"
        >
          Выйти в меню
        </Button>
      </div>
    </Dialog>
  );
}
