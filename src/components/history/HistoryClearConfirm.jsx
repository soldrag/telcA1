import React from 'react';

export default function HistoryClearConfirm({ onConfirm, onCancel }) {
  return (
    <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 rounded-xl p-1 px-2 text-xs">
      <span className="text-rose-800 font-semibold">Удалить всё?</span>
      <button
        type="button"
        onClick={onConfirm}
        className="px-2 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
      >
        Да, очистить
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-1 text-slate-600 hover:text-slate-900 font-medium"
      >
        Отмена
      </button>
    </div>
  );
}
