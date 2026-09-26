import React, { useRef, useState } from 'react';
import { Mail } from 'lucide-react';
import SchreibenWordCounter from './SchreibenWordCounter.jsx';
import SchreibenUmlautBar from './SchreibenUmlautBar.jsx';
import SchreibenTaskCard from './SchreibenTaskCard.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useTextEntryFocus } from '../../hooks/useTextEntryFocus.js';

const DEFAULT_LEITPUNKTE = ['Grund für Ihr Schreiben', 'Termin und Details', 'Frage oder Bitte um Antwort'];

function resolveLeitpunkte(question) {
  const options = typeof question.options_json === 'string'
    ? JSON.parse(question.options_json || '{}')
    : (question.options_json || {});
  return (options.leitpunkte || DEFAULT_LEITPUNKTE)
    .map((lp) => (typeof lp === 'string' ? lp.replace(/\s*\([^)]*\)/g, '').trim() : lp));
}

function isPhoneWidth() {
  return typeof window !== 'undefined' && window.matchMedia?.('(max-width: 639px)').matches;
}

export default function SchreibenTeil2({
  question = {},
  session = {},
  answers = session.answers || {},
  onSelectAnswer = session.selectAnswer,
  isSubmitted = session.isSubmitted || false,
}) {
  const { t } = useI18n();
  const essayRef = useRef(null);
  const [isTaskCollapsed, setTaskCollapsed] = useState(false);
  const isTyping = useTextEntryFocus();
  const textValue = answers[question.id] || '';
  const updateText = (text) => onSelectAnswer(question.id, text);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-surface-card p-4 sm:p-5 rounded-2xl border border-border-default flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-action-primary-subtle text-action-primary shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-content-primary">Teil 2 • E-Mail / Brief schreiben</h2>
            <p className="text-sm text-content-secondary">{t('exam.schreibenPart2Instruction')}</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-action-primary-subtle text-action-primary">10 Punkte</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <SchreibenTaskCard
            situation={question.situation}
            leitpunkte={resolveLeitpunkte(question)}
            isCollapsed={isTaskCollapsed}
            onToggle={() => setTaskCollapsed((value) => !value)}
          />
        </div>

        <div className="lg:col-span-7 bg-surface-card rounded-2xl border border-border-default p-4 sm:p-6 space-y-3">
          <label htmlFor={`essay-${question.id}`} className="block text-sm font-semibold text-content-primary">Ihre E-Mail:</label>
          <textarea
            ref={essayRef}
            id={`essay-${question.id}`}
            lang="de"
            rows={10}
            disabled={isSubmitted}
            value={textValue}
            onChange={(e) => updateText(e.target.value)}
            onFocus={() => isPhoneWidth() && setTaskCollapsed(true)}
            className="w-full p-4 rounded-xl border border-border-default bg-surface-inset text-content-primary font-sans exam-text focus:outline-none focus:border-action-primary focus:bg-surface-card transition-colors disabled:opacity-75 resize-y min-h-[45dvh] sm:min-h-[13.75rem]"
          />
          {/* Below 1024 px the umlaut keys and word count stick above the bottom bar, or right above the keyboard while typing. */}
          <div className={`sticky ${isTyping ? 'bottom-0' : 'bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))]'} lg:static -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-surface-card border-t border-border-subtle lg:border-0 flex items-center justify-between gap-3 lg:pb-0`}>
            <SchreibenUmlautBar fieldRef={essayRef} value={textValue} onChange={updateText} disabled={isSubmitted} />
            <SchreibenWordCounter text={textValue} targetWords={30} />
          </div>
        </div>
      </div>
    </div>
  );
}
