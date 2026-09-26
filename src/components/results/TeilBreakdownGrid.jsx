import React from 'react';
import { getTestTypeById } from '../../../shared/testTypes.js';
import { formatPoints } from '../../utils/formatPoints.js';
import { getTeilTitles } from '../../config/teilTitles.js';

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
  const titles = getTeilTitles(testType);

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
