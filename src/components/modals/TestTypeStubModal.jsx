import React from 'react';
import { Headphones, PenTool, MessageSquare, Clock, Award, Sparkles } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { Button } from '../ui/Button.jsx';

const MODULE_ICONS = {
  hoeren: Headphones,
  schreiben: PenTool,
  sprechen: MessageSquare,
};

export default function TestTypeStubModal({ testType, isOpen, onClose }) {
  if (!testType) return null;

  const Icon = MODULE_ICONS[testType.id] || Sparkles;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
            <span>Модуль в разработке</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            telc A1 — {testType.title} ({testType.titleRu})
          </h3>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        {testType.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-2 text-slate-700">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Время: <strong>{testType.timeLimitMinutes} минут</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-slate-700">
          <Award className="w-4 h-4 text-slate-400" />
          <span>Баллы: <strong>{testType.maxScore} баллов</strong></span>
        </div>
      </div>

      <div className="mt-5 p-4 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-800">
        💡 Аутентичные задания и интерактивный тренажёр для этого модуля готовятся к публикации. Сейчас вам доступен полноценный модуль <strong>Lesen (Чтение)</strong> из 10 вариантов.
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="default"
          onClick={onClose}
        >
          Понятно, тренировать Чтение
        </Button>
      </div>
    </Dialog>
  );
}
