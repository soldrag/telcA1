import React, { useRef, useEffect } from 'react';
import { Headphones, PenTool, MessageSquare, Clock, Award, X, Sparkles } from 'lucide-react';

const MODULE_ICONS = {
  hoeren: Headphones,
  schreiben: PenTool,
  sprechen: MessageSquare,
};

export default function TestTypeStubModal({ testType, isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !testType) return;
    const focusableEls = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableEls?.length) focusableEls[0].focus();
  }, [isOpen, testType]);

  if (!isOpen || !testType) return null;

  const Icon = MODULE_ICONS[testType.id] || Sparkles;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key !== 'Tab') return;
    const focusableEls = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableEls?.length) return;
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="test-type-stub-title"
      onKeyDown={handleKeyDown}
    >
      <div ref={modalRef} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-5 right-5 flex items-center space-x-2 p-2 min-h-[44px] min-w-[44px] text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          <span className="text-sm font-medium">Закрыть</span>
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
              <span>Модуль в разработке</span>
            </div>
            <h3 id="test-type-stub-title" className="text-xl font-bold text-slate-900 mt-1">
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
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 min-h-[44px] min-w-[44px] bg-telc-600 hover:bg-telc-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            Понятно, тренировать Чтение
          </button>
        </div>
      </div>
    </div>
  );
}
