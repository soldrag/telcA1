import React from 'react';

const TEIL_TITLES = {
  1: 'Teil 1: E-Mails / Briefe',
  2: 'Teil 2: Internet / Webseiten',
  3: 'Teil 3: Schilder / Aushänge',
};

export default function TeilBreakdownGrid({ teilBreakdown = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/15">
      {[1, 2, 3].map((teilNum) => {
        const score = teilBreakdown[teilNum]?.score || 0;
        const total = teilBreakdown[teilNum]?.total || 5;
        const percent = total > 0 ? Math.round((score / total) * 100) : 0;

        return (
          <div key={teilNum} className="bg-black/20 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
            <div className="text-xs text-white/80 font-medium">
              {TEIL_TITLES[teilNum]}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-white">
                {score} / {total}
              </span>
              <span className="text-xs text-white/80 font-semibold">
                {percent}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
