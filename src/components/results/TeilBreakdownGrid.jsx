import React from 'react';
import { getTestTypeById } from '../../../shared/testTypes.js';
import { formatPoints } from '../../utils/formatPoints.js';

const TEIL_TITLES_BY_MODULE = {
  schreiben: { 1: 'Teil 1: Formular', 2: 'Teil 2: Brief' },
  hoeren: { 1: 'Teil 1: Gespräche', 2: 'Teil 2: Durchsagen', 3: 'Teil 3: Telefon' },
  lesen: { 1: 'Teil 1: E-Mails / Briefe', 2: 'Teil 2: Internet / Webseiten', 3: 'Teil 3: Schilder / Aushänge' },
};

function resolveTeils(teilBreakdown, testType) {
  const active = Object.keys(teilBreakdown)
    .map(Number)
    .filter((teil) => teilBreakdown[teil] && (teilBreakdown[teil].total > 0 || teilBreakdown[teil].score > 0));
  if (active.length > 0) return active;
  return Array.from({ length: getTestTypeById(testType)?.partsCount ?? 3 }, (_, i) => i + 1);
}

/**
 * Per-Teil points as compact chips under the total score.
 */
export default function TeilBreakdownGrid({ teilBreakdown = {}, testType = 'lesen', language }) {
  const titles = TEIL_TITLES_BY_MODULE[testType] || TEIL_TITLES_BY_MODULE.lesen;

  return (
    <ul className="flex flex-wrap gap-2">
      {resolveTeils(teilBreakdown, testType).map((teil) => {
        const { score = 0, total = 5 } = teilBreakdown[teil] || {};
        return (
          <li key={teil} lang="de" className="px-3 py-1.5 rounded-lg bg-surface-inset text-sm text-content-secondary">
            {titles[teil] || `Teil ${teil}`} · <span className="font-semibold text-content-primary tabular-nums">{formatPoints(score, language)}/{total}</span>
          </li>
        );
      })}
    </ul>
  );
}
