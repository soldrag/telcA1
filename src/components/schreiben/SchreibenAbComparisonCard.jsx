import React from 'react';
import { GitCompare, Zap, Cpu, Check, AlertCircle, X, Clock } from 'lucide-react';

export default function SchreibenAbComparisonCard({ comparison, onClose, language = 'de' }) {
  if (!comparison) return null;

  const isRu = language === 'ru';
  const { pointsA, pointsB, scoreDelta, durationMsA, durationMsB, speedupFactor, agreementRate, criteriaComparison } = comparison;

  return (
    <div className="p-4 rounded-xl border-2 border-action-primary-border bg-surface-card shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-border-default pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-action-primary-subtle text-action-primary">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-content-primary">
              {isRu ? 'A/B Сравнение: LLM vs Микро-ранжировщик' : 'A/B-Vergleich: LLM vs. Micro-Ranker'}
            </h4>
            <span className="text-[11px] text-content-secondary font-medium">
              {isRu ? `Согласованность решений: ${agreementRate}%` : `Entscheidungsübereinstimmung: ${agreementRate}%`}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-inset text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
          title="Schließen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-surface-inset border border-border-default space-y-1">
          <div className="text-[10px] uppercase font-bold text-content-secondary flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-action-primary" />
            <span>LLM Qwen3 (A)</span>
          </div>
          <div className="text-base font-extrabold text-content-primary">{pointsA} Pkt</div>
          <div className="text-[10px] text-content-secondary flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{durationMsA} ms</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-action-primary-subtle/30 border border-action-primary-border space-y-1">
          <div className="text-[10px] uppercase font-bold text-action-primary flex items-center space-x-1">
            <Zap className="w-3 h-3 text-action-primary" />
            <span>⚡ Ranker (B)</span>
          </div>
          <div className="text-base font-extrabold text-action-primary">
            {pointsB} Pkt
            {scoreDelta !== 0 && (
              <span className={`ml-1 text-xs font-bold ${scoreDelta > 0 ? 'text-state-success-text' : 'text-state-warning-text'}`}>
                ({scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta})
              </span>
            )}
          </div>
          <div className="text-[10px] text-content-secondary flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{durationMsB} ms ({speedupFactor}x)</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-surface-inset border border-border-default space-y-1 flex flex-col justify-center">
          <div className="text-[10px] uppercase font-bold text-content-secondary">
            {isRu ? 'Итог A/B' : 'Ergebnis'}
          </div>
          <div className="text-xs font-bold text-content-primary">
            {agreementRate === 100
              ? (isRu ? '🎯 100% совпадение' : '🎯 100% Übereinstimmung')
              : (isRu ? `⚠️ Расхождение на ${Math.abs(scoreDelta)} б.` : `⚠️ Differenz: ${Math.abs(scoreDelta)} Pkt`)}
          </div>
          <div className="text-[10px] text-state-success-text font-medium">
            {speedupFactor > 1 ? `⚡ В ${speedupFactor} раз быстрее` : 'Gleiches Tempo'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
        {criteriaComparison.map((c) => (
          <div
            key={c.id}
            className={`p-2 rounded-lg border text-center text-[11px] font-medium ${
              c.isMatch ? 'border-state-success-border bg-state-success-subtle/20' : 'border-state-warning-border bg-state-warning-subtle/20'
            }`}
          >
            <div className="font-bold text-content-primary flex items-center justify-center space-x-1">
              <span>{c.label}</span>
              {c.isMatch ? (
                <Check className="w-3 h-3 text-state-success-text" />
              ) : (
                <AlertCircle className="w-3 h-3 text-state-warning-text" />
              )}
            </div>
            <div className="text-[10px] text-content-secondary font-mono mt-0.5">
              A: {c.scoreA} | B: {c.scoreB}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
