import React from 'react';

export default function Teil3NoticeCard({ contextHeader, contextBody }) {
  return (
    <div className="p-6 sm:p-8 bg-slate-100/70 flex justify-center">
      <div className="w-full max-w-2xl bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-6 sm:p-8 shadow-sm relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-amber-200/90 rounded-sm border border-amber-300 shadow-xs transform -rotate-1" />

        {contextHeader && (
          <div className="text-center font-black text-slate-950 text-base sm:text-xl border-b-2 border-amber-300/80 pb-3 mb-4 uppercase tracking-wider">
            {contextHeader}
          </div>
        )}

        <div className="text-slate-950 text-base sm:text-lg font-medium font-sans whitespace-pre-line leading-relaxed text-center sm:text-left">
          {contextBody}
        </div>
      </div>
    </div>
  );
}
