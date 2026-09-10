import React from 'react';
import { Clock } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { Button } from '../ui/Button.jsx';

export default function TimeUpModal({ isOpen, onConfirm }) {
  return (
    <Dialog isOpen={isOpen} onClose={onConfirm} maxWidth="max-w-md">
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900">Время вышло!</h3>
          <p className="text-sm text-slate-600">
            Установленное время экзамена истекло. Ваши текущие ответы отправляются на автоматическую проверку.
          </p>
        </div>
        <Button
          variant="default"
          onClick={onConfirm}
          className="w-full py-3 font-bold text-white bg-telc-700 hover:bg-telc-800 rounded-xl"
        >
          Посмотреть результаты
        </Button>
      </div>
    </Dialog>
  );
}
