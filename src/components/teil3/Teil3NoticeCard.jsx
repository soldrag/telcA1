import React from 'react';

export default function Teil3NoticeCard({ contextHeader, contextBody }) {
  return (
    <div className="p-6 sm:p-8 bg-surface-inset flex justify-center">
      <div className="w-full max-w-2xl bg-state-warning-subtle border-2 border-state-warning-border rounded-2xl p-6 sm:p-8 shadow-sm relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-state-warning-muted rounded-sm border border-state-warning-border shadow-xs transform -rotate-1" />

        {contextHeader && (
          <div className="text-center font-black text-state-warning-text text-base sm:text-xl border-b-2 border-state-warning-border pb-3 mb-4 uppercase tracking-wider">
            {contextHeader}
          </div>
        )}

        <div className="text-content-primary text-base sm:text-lg font-medium font-sans whitespace-pre-line leading-relaxed text-center sm:text-left">
          {contextBody}
        </div>
      </div>
    </div>
  );
}
