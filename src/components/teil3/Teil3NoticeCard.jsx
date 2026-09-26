import React from 'react';

export default function Teil3NoticeCard({ contextHeader, contextBody }) {
  return (
    <div className="p-4 sm:p-6 bg-surface-inset flex items-center justify-center">
      <div lang="de" className="w-full max-w-xl bg-state-warning-subtle border border-state-warning-border rounded-xl p-5 sm:p-6">
        {contextHeader && (
          <div className="text-center font-semibold text-state-warning-text exam-text border-b border-state-warning-border pb-3 mb-3">
            {contextHeader}
          </div>
        )}
        <div className="exam-reading text-content-primary whitespace-pre-line">
          {contextBody}
        </div>
      </div>
    </div>
  );
}
