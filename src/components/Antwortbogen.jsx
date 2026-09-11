import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import AntwortbogenColumn from './antwortbogen/AntwortbogenColumn.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function Antwortbogen({
  questions = [],
  answers = {},
  onSelectQuestion,
  isSubmitted,
  results = null,
}) {
  const { t } = useI18n();
  const teil1Questions = questions.filter((question) => question.teil === 1);
  const teil2Questions = questions.filter((question) => question.teil === 2);
  const teil3Questions = questions.filter((question) => question.teil === 3);

  return (
    <div className="bg-surface-card rounded-2xl border-2 border-border-default p-4 sm:p-6 shadow-md">
      <div className="flex items-center justify-between border-b-2 border-border-strong pb-3 mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-content-tertiary">
            Offizieller Prüfungsvordruck
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-content-primary uppercase tracking-tight">
            Antwortbogen S10 — Teil Lesen
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono font-bold bg-surface-inset px-3 py-1 rounded border border-border-default">
          <FileSpreadsheet className="w-4 h-4 text-content-secondary" />
          <span className="text-content-primary">S10-LESEN</span>
        </div>
      </div>

      <p className="text-xs text-content-secondary mb-4">
        {t('exam.antwortbogenNotice')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AntwortbogenColumn
          title="Teil 1 (1–5)"
          subtitle="[ + / - ]"
          questions={teil1Questions}
          answers={answers}
          results={results}
          options={['richtig', 'falsch']}
          labels={['+', '-']}
          onSelectQuestion={onSelectQuestion}
        />

        <AntwortbogenColumn
          title="Teil 2 (6–10)"
          subtitle="[ a / b ]"
          questions={teil2Questions}
          answers={answers}
          results={results}
          options={['a', 'b']}
          labels={['a', 'b']}
          onSelectQuestion={onSelectQuestion}
        />

        <AntwortbogenColumn
          title="Teil 3 (11–15)"
          subtitle="[ + / - ]"
          questions={teil3Questions}
          answers={answers}
          results={results}
          options={['richtig', 'falsch']}
          labels={['+', '-']}
          onSelectQuestion={onSelectQuestion}
        />
      </div>
    </div>
  );
}
