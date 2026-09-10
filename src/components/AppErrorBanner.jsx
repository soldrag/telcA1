import React from 'react';

export default function AppErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center justify-between">
        <span>{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-rose-600 font-bold hover:underline ml-4"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
