import React from 'react';
import { Search, ChevronDown, CheckCircle2, AlertTriangle, XCircle, Cpu } from 'lucide-react';

const I18N_TEXTS = {
  ru: {
    title: 'Детали проверки микро-ранжировщика (System 1)',
    modelTag: 'EmbeddingGemma 300M (q4)',
    explanation: 'Семантическое сопоставление пунктов плана с предложениями письма:',
    matchedLabel: 'Найденное предложение:',
    noMatch: 'Подходящее предложение в тексте не найдено',
    subAspectsTitle: 'Составные аспекты (Fuzzy Min-Pooling):',
    arbitratedTag: '⚡ Решение Micro-Ranker',
    scoreLabel: 'Балл:',
    fullCoverage: 'Полное соответствие',
    partialCoverage: 'Частичное соответствие',
    noCoverage: 'Не раскрыто',
    emptyNotice: 'Запустите проверку выше, чтобы увидеть подробный разбор совпадений.',
  },
  de: {
    title: 'Details der Micro-Ranker-Analyse (System 1)',
    modelTag: 'EmbeddingGemma 300M (q4)',
    explanation: 'Semantischer Abgleich der Leitpunkte mit den Briefsätzen:',
    matchedLabel: 'Zugeordneter Satz:',
    noMatch: 'Kein passender Satz im Text gefunden',
    subAspectsTitle: 'Teilaspekte (Fuzzy Min-Pooling):',
    arbitratedTag: '⚡ Micro-Ranker-Entscheidung',
    scoreLabel: 'Punkte:',
    fullCoverage: 'Vollständig erfüllt',
    partialCoverage: 'Teilweise erfüllt',
    noCoverage: 'Nicht erfüllt',
    emptyNotice: 'Starten Sie die Prüfung oben, um die genaue Satzanalyse zu sehen.',
  },
  en: {
    title: 'Micro-Ranker Analysis Details (System 1)',
    modelTag: 'EmbeddingGemma 300M (q4)',
    explanation: 'Semantic alignment of task points with letter sentences:',
    matchedLabel: 'Matched sentence:',
    noMatch: 'No matching sentence found in the text',
    subAspectsTitle: 'Sub-aspects (Fuzzy Min-Pooling):',
    arbitratedTag: '⚡ Micro-Ranker Decision',
    scoreLabel: 'Score:',
    fullCoverage: 'Fully addressed',
    partialCoverage: 'Partially addressed',
    noCoverage: 'Not addressed',
    emptyNotice: 'Run the check above to inspect sentence-level alignments.',
  },
};

function formatCoverageLabel(cov, texts) {
  if (cov === 'full') return texts.fullCoverage;
  if (cov === 'partial') return texts.partialCoverage;
  return texts.noCoverage;
}

function renderAspectRow(asp, idx) {
  const isOk = asp.coverage === 'full';
  const isPart = asp.coverage === 'partial';
  const pct = Math.round((asp.score || 0) * 100);
  const badgeCls = isOk
    ? 'bg-state-success-subtle text-state-success-text border-state-success-border'
    : (isPart ? 'bg-state-warning-subtle text-state-warning-text border-state-warning-border' : 'bg-surface-raised text-content-muted border-border-default');

  return (
    <div key={idx} className="flex items-center justify-between text-[11px] gap-2 py-0.5">
      <div className="flex items-center space-x-1.5 truncate">
        {isOk ? <CheckCircle2 className="w-3 h-3 text-state-success flex-shrink-0" /> :
         isPart ? <AlertTriangle className="w-3 h-3 text-state-warning flex-shrink-0" /> :
         <XCircle className="w-3 h-3 text-content-muted flex-shrink-0" />}
        <span className="font-semibold text-content-primary truncate">{asp.aspect}</span>
        {asp.matchedSentence && (
          <span className="italic text-content-secondary truncate text-[10px]">
            «{asp.matchedSentence}»
          </span>
        )}
      </div>
      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${badgeCls}`}>
        {pct}%
      </span>
    </div>
  );
}

export default function SchreibenRankerDetailsCard({ diagnosticData, language = 'ru' }) {
  const texts = I18N_TEXTS[language] || I18N_TEXTS.de;
  const items = diagnosticData?.diagnostic?.items || diagnosticData?.items || [];
  if (!items || items.length === 0) return null;

  return (
    <details className="mt-3 group rounded-xl border border-border-default bg-surface-card overflow-hidden">
      <summary className="flex items-center justify-between p-3.5 cursor-pointer bg-surface-raised/40 hover:bg-surface-raised select-none transition-colors">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-action-primary flex-shrink-0" />
          <span className="text-xs font-bold text-content-primary">{texts.title}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-action-primary-subtle/50 text-action-primary flex items-center space-x-1">
            <Cpu className="w-3 h-3" />
            <span>{texts.modelTag}</span>
          </span>
          <ChevronDown className="w-4 h-4 text-content-muted transition-transform group-open:rotate-180" />
        </div>
      </summary>

      <div className="p-3.5 space-y-3 border-t border-border-subtle bg-surface-card">
        <p className="text-[11px] text-content-secondary leading-relaxed">
          {texts.explanation}
        </p>

        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const sc = item.score ?? 0;
            const ranker = item.rankerDetails;
            const matched = ranker?.matchedSentence || item.matchedSentence;
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
                    {item.arbitrated && (
                      <span className="text-[10px] font-bold text-action-primary px-1.5 py-0.2 rounded bg-action-primary-subtle">
                        {texts.arbitratedTag}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${scoreColor}`}>
                    {sc} / 2 Pkt
                  </span>
                </div>

                {matched ? (
                  <div className="text-xs text-content-primary bg-surface-card p-2 rounded border border-border-subtle leading-relaxed">
                    <span className="font-semibold text-action-primary mr-1">{texts.matchedLabel}</span>
                    <span className="italic">«{matched}»</span>
                    {ranker?.score !== undefined && (
                      <span className="ml-2 font-mono text-[10px] text-content-muted font-bold">
                        ({Math.round(ranker.score * 100)}% {formatCoverageLabel(ranker.coverage, texts)})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs italic text-content-muted">
                    {texts.noMatch}
                  </div>
                )}

                {ranker?.isCompound && Array.isArray(ranker.aspects) && ranker.aspects.length > 1 && (
                  <div className="mt-1.5 pt-1.5 border-t border-border-subtle/50 pl-2 border-l-2 border-action-primary/30 space-y-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-content-secondary">
                      {texts.subAspectsTitle}
                    </div>
                    {ranker.aspects.map((asp, aIdx) => renderAspectRow(asp, aIdx))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
