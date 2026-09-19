import React from 'react';
import { FileText, Compass, Target, CheckCircle2, XCircle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

function EssayTaskView({ situation, leitpunkte, statement, t }) {
  return (
    <div className="bg-surface-card rounded-2xl border-2 border-action-primary-border/60 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center space-x-2 text-action-primary font-black text-xs uppercase tracking-wider">
        <Compass className="w-4 h-4" />
        <span>{t('results.taskAssignment')}</span>
      </div>

      {situation && (
        <p className="text-sm sm:text-base font-bold text-content-primary leading-snug">
          {situation}
        </p>
      )}

      {leitpunkte.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border-default">
          <div className="text-xs font-black uppercase tracking-wider text-content-secondary">
            {t('results.taskLeitpunkte')} (3):
          </div>
          <div className="grid grid-cols-1 gap-2">
            {leitpunkte.map((lp, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 p-2.5 bg-surface-inset rounded-xl border border-border-default text-xs sm:text-sm font-medium text-content-primary"
              >
                <span className="w-5 h-5 rounded-full bg-action-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{lp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {statement && (
        <p className="text-xs text-content-tertiary italic pt-1 border-t border-border-subtle">
          {statement}
        </p>
      )}
    </div>
  );
}

function ChoiceOptionsView({ options = [], correctAnswer, userAnswer }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
      {options.map((opt) => {
        const isCorrect = opt.id === correctAnswer;
        const isSelected = opt.id === userAnswer;
        return (
          <div
            key={opt.id}
            className={`p-3.5 rounded-xl border transition-all text-xs space-y-1.5 ${
              isCorrect
                ? 'bg-state-success-subtle/40 border-state-success-border text-state-success-text'
                : isSelected
                ? 'bg-state-error-subtle/30 border-state-error-border text-content-primary'
                : 'bg-surface-raised border-border-default text-content-primary'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="font-mono uppercase text-[11px] px-2 py-0.5 rounded bg-surface-card border border-border-default">
                [{opt.id.toUpperCase()}] {opt.title}
              </span>
              {isCorrect && (
                <span className="flex items-center space-x-1 text-[11px] text-state-success font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Richtig</span>
                </span>
              )}
              {isSelected && !isCorrect && (
                <span className="flex items-center space-x-1 text-[11px] text-state-error font-black">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Ihre Wahl</span>
                </span>
              )}
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">{opt.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function ReviewTaskPrompt({ item = {} }) {
  const { t } = useI18n();
  const options = item.options_json || {};
  const isEssay = options?.type === 'essay' || item?.question_type === 'essay' || item?.type === 'essay';
  const rawLeitpunkte = isEssay ? (options.leitpunkte || []) : [];
  const leitpunkte = rawLeitpunkte.map(lp =>
    typeof lp === 'string' ? lp.replace(/\s*\([^)]*\)/g, '').trim() : lp
  );
  const isChoiceList = Array.isArray(options) && options.length > 0;

  if (isEssay) {
    return (
      <EssayTaskView
        situation={item.situation}
        leitpunkte={leitpunkte}
        statement={item.statement}
        t={t}
      />
    );
  }

  return (
    <div className="space-y-3">
      {item.situation && (
        <div className="p-3.5 sm:p-4 rounded-xl border border-action-primary-border/50 bg-action-primary-subtle/20 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-action-primary font-black text-xs uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>{t('results.taskSituation')}</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-content-primary leading-snug">
            {item.situation}
          </p>
        </div>
      )}

      {item.context_body && (
        <div className="bg-surface-inset p-4 rounded-xl border border-border-default text-xs sm:text-sm font-sans text-content-primary whitespace-pre-line leading-relaxed">
          <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-content-tertiary mb-2">
            <FileText className="w-3.5 h-3.5 text-action-primary" />
            <span>{item.context_header || t('results.originalText')}</span>
          </div>
          {item.context_body}
        </div>
      )}

      {isChoiceList && (
        <ChoiceOptionsView
          options={options}
          correctAnswer={item.correct_answer}
          userAnswer={item.user_answer}
        />
      )}

      {item.statement && (
        <div className="p-3 rounded-xl border border-border-default bg-surface-card flex items-start space-x-2.5">
          <Target className="w-4 h-4 text-action-primary flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-content-secondary block">
              {t('results.taskStatement')}:
            </span>
            <span className="text-xs sm:text-sm font-bold text-content-primary leading-snug">
              {item.statement}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
