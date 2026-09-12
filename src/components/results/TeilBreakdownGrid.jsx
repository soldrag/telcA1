import React from 'react';

const TEIL_TITLES_BY_MODULE = {
  schreiben: {
    1: 'Teil 1: Formular',
    2: 'Teil 2: Brief',
  },
  hoeren: {
    1: 'Teil 1: Gespräche',
    2: 'Teil 2: Durchsagen',
    3: 'Teil 3: Telefon',
  },
  lesen: {
    1: 'Teil 1: E-Mails / Briefe',
    2: 'Teil 2: Internet / Webseiten',
    3: 'Teil 3: Schilder / Aushänge',
  },
};

export default function TeilBreakdownGrid({ teilBreakdown = {}, testType = 'lesen' }) {
  const titles = TEIL_TITLES_BY_MODULE[testType] || TEIL_TITLES_BY_MODULE.lesen;
  const activeTeils = Object.keys(teilBreakdown)
    .map(Number)
    .filter((t) => teilBreakdown[t] && (teilBreakdown[t].total > 0 || teilBreakdown[t].score > 0));

  const displayTeils = activeTeils.length > 0
    ? activeTeils
    : (testType === 'schreiben' ? [1, 2] : [1, 2, 3]);

  const gridColsClass = displayTeils.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 ${gridColsClass} gap-3 mt-8 pt-6 border-t border-white/15`}>
      {displayTeils.map((teilNum) => {
        const item = teilBreakdown[teilNum];
        const score = item?.score || 0;
        const defaultTotal = testType === 'schreiben' ? (teilNum === 2 ? 10 : 5) : 5;
        const total = item?.total || defaultTotal;
        const percent = total > 0 ? Math.round((score / total) * 100) : 0;

        return (
          <div key={teilNum} className="bg-black/20 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
            <div className="text-xs text-white/80 font-medium">
              {titles[teilNum] || `Teil ${teilNum}`}
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
