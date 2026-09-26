import React from 'react';

function toPercent(value, max) {
  return max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
}

/**
 * Score fill with a tick at the pass mark, so the gap to "bestanden" is visible at a glance.
 */
export default function ScoreThresholdBar({ score, passScore, maxScore, passed, label }) {
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={maxScore}
      aria-valuenow={score}
      aria-label={label}
      className="relative h-2.5 rounded-full bg-surface-inset"
    >
      <div
        className={`absolute inset-y-0 left-0 rounded-full ${passed ? 'bg-state-success' : 'bg-state-error'}`}
        style={{ width: `${toPercent(score, maxScore)}%` }}
      />
      <div
        aria-hidden="true"
        className="absolute -top-1 -bottom-1 w-0.5 rounded bg-content-primary"
        style={{ left: `calc(${toPercent(passScore, maxScore)}% - 1px)` }}
      />
    </div>
  );
}
