import React from 'react';
import { getTestTypeById } from '../../../shared/testTypes.js';
import { formatPoints } from '../../utils/formatPoints.js';
import { NUMERIC } from '../layout/typography.js';
import { getTeilTitles } from '../../config/teilTitles.js';

function resolveTeils(teilBreakdown, testType) {
  const active = Object.keys(teilBreakdown)
    .map(Number)
    .filter((teil) => teilBreakdown[teil] && (teilBreakdown[teil].total > 0 || teilBreakdown[teil].score > 0));
  if (active.length > 0) return active;
  return Array.from({ length: getTestTypeById(testType)?.partsCount ?? 3 }, (_, i) => i + 1);
}

/**
 * Per-Teil points as compact chips under the total score; from 1024 px one row of equal cells.
 */
export default function TeilBreakdownGrid({ teilBreakdown = {}, testType = 'lesen', language }) {
  const titles = getTeilTitles(testType);

  return (
    <ul className="flex flex-wrap gap-2 lg:grid lg:grid-flow-col lg:auto-cols-fr">
      {resolveTeils(teilBreakdown, testType).map((teil) => {
        const { score = 0, total = 5 } = teilBreakdown[teil] || {};
        return (
          <li key={teil} lang="de" className="px-3 py-1.5 rounded-lg bg-surface-inset text-sm text-content-secondary lg:flex lg:justify-between lg:gap-2 min-w-0">
            <span className="lg:truncate" title={titles[teil] || undefined}>{titles[teil] || `Teil ${teil}`}</span><span className="lg:hidden"> · </span>
            <span className={`font-semibold text-content-primary ${NUMERIC} shrink-0`}>{formatPoints(score, language)}/{total}</span>
          </li>
        );
      })}
    </ul>
  );
}
