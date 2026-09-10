import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import AntwortbogenColumn from './antwortbogen/AntwortbogenColumn.jsx';

export default function Antwortbogen({
  questions = [],
  answers = {},
  onSelectQuestion,
  isSubmitted,
  results = null,
}) {
  const teil1Questions = questions.filter((q) => q.teil === 1);
  const teil2Questions = questions.filter((q) => q.teil === 2);
  const teil3Questions = questions.filter((q) => q.teil === 3);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Offizieller Prüfungsvordruck
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-tight">
            Antwortbogen S10 — Teil Lesen
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded border border-slate-300">
          <FileSpreadsheet className="w-4 h-4 text-slate-700" />
          <span>S10-LESEN</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-4">
        Здесь отображаются ваши заполненные ответы в формате официального экзаменационного бланка:
      </p>

      {/* Grid of 3 Teile */}
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
