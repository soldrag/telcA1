import React, { useEffect, useRef } from 'react';
import { X, History } from 'lucide-react';
import HistoryItemCard from './history/HistoryItemCard.jsx';

export default function HistoryModal({
  isOpen,
  onClose,
  onLoadAttempt,
  attempts = [],
  loading = false,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (modalRef.current) {
      const focusable = modalRef.current.querySelector('button');
      if (focusable) focusable.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-telc-100 text-telc-700 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 id="history-modal-title" className="text-xl font-bold text-slate-900">
                История попыток
              </h3>
              <p className="text-xs text-slate-500">
                Все сохранённые результаты прохождения тестов в SQLite
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-200" />
                    <div>
                      <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-24" />
                    </div>
                  </div>
                  <div className="w-12 h-8 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Пока нет сохранённых результатов. Завершите тест, чтобы увидеть здесь свою попытку!
            </div>
          ) : (
            attempts.map((att) => (
              <HistoryItemCard
                key={att.id}
                attempt={att}
                onSelect={(id) => {
                  onLoadAttempt(id);
                  onClose();
                }}
                compact
              />
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
