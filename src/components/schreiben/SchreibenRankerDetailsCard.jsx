import React from 'react';
import { Search, ChevronDown, Cpu } from 'lucide-react';
import { RANKER_DETAILS_TEXTS } from './schreibenRankerDetailsTexts.js';
import { scoreCriteriaLevels } from '../../services/schreiben/regulations/index.js';
import { formatPoints } from '../../utils/formatPoints.js';

function resolveItemPoints(item) {
  if (typeof item.points === 'number') return { points: item.points, maxPoints: item.maxPoints };
  return scoreCriteriaLevels({ lp1: item.score }).leitpunkte[0];
}

function renderUnassigned(sentences, texts) {
  if (!sentences?.length) return null;
  return (
    <div className="p-2.5 rounded-lg border border-dashed border-border-default space-y-1">
      <div className="text-[0.625rem] font-extrabold uppercase tracking-wider text-content-secondary">{texts.unassignedTitle}</div>
      {sentences.map((s, i) => <div key={i} className="text-xs italic text-content-primary">«{s}»</div>)}
    </div>
  );
}

// One reading of a Leitpunkt unit (the point or a declared aspect): its best support and the span it came from.
function renderUnitRow(unit, idx) {
  const pct = Math.round((unit.support || 0) * 100);
  const name = String(unit.key || '').split(':').slice(1).join(':') || unit.key;
  return (
    <div key={idx} className="flex items-center justify-between text-[0.6875rem] gap-2 py-0.5">
      <div className="flex items-center space-x-1.5 truncate">
        <span className="font-semibold text-content-primary truncate">{name}</span>
        {unit.span && <span className="italic text-content-secondary truncate text-[0.625rem]">«{unit.span}»</span>}
      </div>
      <span className="font-mono text-[0.625rem] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 bg-surface-raised text-content-secondary border-border-default">
        {pct}%
      </span>
    </div>
  );
}

export default function SchreibenRankerDetailsCard({ diagnosticData, language = 'ru' }) {
  const texts = RANKER_DETAILS_TEXTS[language] || RANKER_DETAILS_TEXTS.de;
  const items = diagnosticData?.diagnostic?.items || diagnosticData?.items || [];
  const unassigned = diagnosticData?.diagnostic?.unassignedSentences;
  if (!items || items.length === 0) return null;
  const engine = items[0]?.rankerDetails?.engine;
  const engineTag = texts.engineTags[engine];

  return (
    <details className="mt-3 group rounded-xl border border-border-default bg-surface-card overflow-hidden">
      <summary className="flex items-center justify-between p-3.5 cursor-pointer bg-surface-raised/40 hover:bg-surface-raised select-none transition-colors">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-action-primary flex-shrink-0" />
          <span className="text-xs font-bold text-content-primary">{texts.title}</span>
        </div>
        <div className="flex items-center space-x-2">
          {engineTag && (
            <span className="text-[0.625rem] font-mono font-bold px-2 py-0.5 rounded bg-action-primary-subtle/50 text-action-primary flex items-center space-x-1">
              <Cpu className="w-3 h-3" />
              <span>{engineTag}</span>
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-content-muted transition-transform group-open:rotate-180" />
        </div>
      </summary>

      <div className="p-3.5 space-y-3 border-t border-border-subtle bg-surface-card">
        <p className="text-[0.6875rem] text-content-secondary leading-relaxed">
          {texts.explanation}
        </p>

        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const sc = item.score ?? 0;
            const { points, maxPoints } = resolveItemPoints(item);
            const units = item.rankerDetails?.units || [];
            const matched = item.matchedSentence;
            const scoreColor = sc === 2
              ? 'bg-state-success text-white'
              : (sc === 1 ? 'bg-state-warning text-white' : 'bg-surface-raised text-content-muted');

            return (
              <div key={item.id || idx} className="p-2.5 rounded-lg border border-border-subtle bg-surface-inset space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-content-primary">
                      Punkt {idx + 1}: {item.label || item.id}
                    </span>
                  </div>
                  <span className={`text-[0.6875rem] font-mono font-bold px-2 py-0.5 rounded ${scoreColor}`}>
                    {formatPoints(points, language)} / {formatPoints(maxPoints, language)} Pkt
                  </span>
                </div>

                {matched ? (
                  <div className="text-xs text-content-primary bg-surface-card p-2 rounded border border-border-subtle leading-relaxed">
                    <span className="font-semibold text-action-primary mr-1">{texts.matchedLabel}</span>
                    <span className="italic">«{matched}»</span>
                  </div>
                ) : (
                  <div className="text-xs italic text-content-muted">
                    {texts.noMatch}
                  </div>
                )}

                {units.length > 1 && (
                  <div className="mt-1.5 pt-1.5 border-t border-border-subtle/50 pl-2 border-l-2 border-action-primary/30 space-y-1">
                    <div className="text-[0.625rem] font-extrabold uppercase tracking-wider text-content-secondary">
                      {texts.unitsTitle}
                    </div>
                    {units.map(renderUnitRow)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {renderUnassigned(unassigned, texts)}
      </div>
    </details>
  );
}
