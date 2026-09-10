import React, { useState } from 'react';
import { Mail, Check, X, HelpCircle, Calendar, User, Tag, Type } from 'lucide-react';

/**
 * Parses raw context_header text (e.g. Von:...\nAn:...\nDatum:...\nBetreff:...)
 * into structured key-value lines with realistic email UI elements.
 */
function EmailHeader({ headerText }) {
  if (!headerText) return null;

  const lines = headerText.split('\n').filter(Boolean);
  const parsed = lines.map(line => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      return { key: match[1].trim(), value: match[2].trim() };
    }
    return { key: '', value: line.trim() };
  });

  const getIconForKey = (key) => {
    const lower = key.toLowerCase();
    if (lower === 'von' || lower === 'an') return <User className="w-4 h-4 text-telc-700" />;
    if (lower === 'datum') return <Calendar className="w-4 h-4 text-amber-700" />;
    if (lower === 'betreff') return <Tag className="w-4 h-4 text-blue-700" />;
    return <Mail className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="mb-4 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
      <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-telc-700" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            E-Mail Kopfzeile
          </span>
        </div>
        <span className="text-xs font-bold text-telc-800 bg-telc-100 px-2 py-1 rounded border border-telc-200">
          Posteingang
        </span>
      </div>

      <div className="p-4 space-y-2 text-xs sm:text-sm divide-y divide-slate-100">
        {parsed.map((item, idx) => {
          const isSubject = item.key.toLowerCase() === 'betreff';

          return (
            <div
              key={idx}
              className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 ${
                idx > 0 ? 'pt-2' : ''
              }`}
            >
              {item.key ? (
                <div className="flex items-center space-x-2 w-24 flex-shrink-0 text-slate-600 font-bold text-xs uppercase tracking-wide">
                  {getIconForKey(item.key)}
                  <span>{item.key}:</span>
                </div>
              ) : null}
              <div
                className={`flex-1 break-words ${
                  isSubject
                    ? 'font-bold text-slate-950 text-sm sm:text-base'
                    : 'text-slate-900 font-medium'
                }`}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Teil1({
  questions = [],
  answers = {},
  onSelectAnswer,
  isSubmitted,
}) {
  // Local zoom preference for reading text: 'normal' (16-17px), 'large' (18-19px), 'xlarge' (20-21px)
  const [fontSizeLevel, setFontSizeLevel] = useState('normal');

  // Group questions by title/context so the email and its questions are displayed together
  const groupedByText = questions.reduce((acc, q) => {
    const key = q.title || 'Text';
    if (!acc[key]) {
      acc[key] = {
        title: q.title,
        header: q.context_header,
        body: q.context_body,
        items: []
      };
    }
    acc[key].items.push(q);
    return acc;
  }, {});

  const bodyTextClasses = {
    normal: 'text-base leading-relaxed',
    large: 'text-xl leading-relaxed',
    xlarge: 'text-xl leading-loose',
  }[fontSizeLevel];

  return (
    <div className="space-y-8">
      {/* Official Section Banner */}
      <div className="bg-white border-l-4 border-telc-600 rounded-r-2xl p-5 shadow-sm border-y border-r border-slate-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-telc-50 text-telc-700 rounded-xl mt-0.5 border border-telc-200 shadow-xs">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-telc-700 bg-telc-50 px-3 py-1 rounded border border-telc-200">
                Leseverstehen • Teil 1
              </span>
              <span className="text-xs text-slate-600 font-bold">Aufgaben 1–5</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-950 mt-1">
              E-Mails, Briefe und persönliche Mitteilungen
            </h2>
            <p className="text-sm text-slate-700 mt-1 font-medium leading-normal">
              Lesen Sie die Texte und die Aufgaben 1 bis 5. Ist die Aussage{' '}
              <strong className="text-emerald-700 font-black">richtig (+)</strong> oder{' '}
              <strong className="text-rose-700 font-black">falsch (-)</strong>?
            </p>
          </div>
        </div>
      </div>

      {/* Texts and corresponding questions in side-by-side or stacked layout */}
      {Object.values(groupedByText).map((group, groupIdx) => {
        const questionNumbers = group.items.map(i => i.question_number).join(', ');
        const answeredInGroup = group.items.filter(i => Boolean(answers[i.id])).length;
        const totalInGroup = group.items.length;

        return (
          <div
            key={groupIdx}
            className="bg-white rounded-3xl border-2 border-slate-300 overflow-hidden shadow-md"
          >
            {/* Group Header Bar */}
            <div className="bg-slate-100/90 border-b-2 border-slate-200 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-black uppercase tracking-wider text-white bg-telc-800 px-3 py-1 rounded-lg shadow-xs">
                  Text {groupIdx + 1}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950">
                  {group.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-300 shadow-xs">
                  К заданиям: <strong className="text-slate-950 font-black">{questionNumbers}</strong>
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${
                  answeredInGroup === totalInGroup
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-200/80 text-slate-800 border-slate-300'
                }`}>
                  {answeredInGroup}/{totalInGroup} готово
                </span>
              </div>
            </div>

            {/* Content: Two-column grid on desktop (Text on left, Questions on right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x-2 lg:divide-slate-200 items-start">
              {/* Left Column: The Email / Letter (Sticky on desktop) */}
              <div className="lg:col-span-7 p-5 sm:p-6 bg-slate-50/70 flex flex-col justify-start lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 bg-white px-3 py-1 rounded border border-slate-300 shadow-xs">
                      Lesetext
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      Deutsch A1
                    </span>
                  </div>

                  {/* Font Size Adjuster */}
                  <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-300 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1 flex items-center pr-1">
                      <Type className="w-3 h-3 mr-0.5" />
                      Текст:
                    </span>
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel('normal')}
                      className={`min-w-[44px] min-h-[44px] px-3 py-2 text-xs font-black rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
                        fontSizeLevel === 'normal'
                          ? 'bg-telc-800 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      }`}
                      title="Обычный шрифт (16px)"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel('large')}
                      className={`min-w-[44px] min-h-[44px] px-3 py-2 text-xs font-black rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
                        fontSizeLevel === 'large'
                          ? 'bg-telc-800 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      }`}
                      title="Крупный шрифт (18px)"
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel('xlarge')}
                      className={`min-w-[44px] min-h-[44px] px-3 py-2 text-xs font-black rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
                        fontSizeLevel === 'xlarge'
                          ? 'bg-telc-800 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                      }`}
                      title="Очень крупный шрифт (20px)"
                    >
                      A++
                    </button>
                  </div>
                </div>

                {/* Email Meta Header */}
                <EmailHeader headerText={group.header} />

                {/* Email / Letter Body */}
                <div className="bg-white p-5 sm:p-8 rounded-2xl border-2 border-slate-200/90 shadow-sm">
                  <div className={`text-slate-950 font-normal whitespace-pre-line ${bodyTextClasses}`}>
                    {group.body}
                  </div>
                </div>
              </div>

              {/* Right Column: The Questions & Richtig/Falsch Selectors */}
              <div className="lg:col-span-5 p-5 sm:p-6 bg-white flex flex-col justify-between space-y-5">
                <div className="space-y-5">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b-2 border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-950">
                      Задания к тексту {groupIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-telc-800 bg-telc-50 px-3 py-1 rounded border border-telc-200">
                      Выберите + или -
                    </span>
                  </div>

                  {group.items.map((q) => {
                    const currentAnswer = answers[q.id];
                    const isAnswered = Boolean(currentAnswer);

                    return (
                      <div
                        key={q.id}
                        id={`question-${q.id}`}
                        className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-4 ${
                          isAnswered
                            ? 'bg-sky-50/40 border-telc-500 shadow-sm ring-1 ring-telc-500/20'
                            : 'bg-white border-slate-300 hover:border-slate-400 shadow-xs'
                        }`}
                      >
                        {/* Question number and statement */}
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-telc-800 text-white font-black text-sm flex items-center justify-center shadow-sm mt-0.5">
                            {q.question_number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-telc-800 bg-telc-50 px-3 py-1 rounded border border-telc-200">
                                Aufgabe {q.question_number}
                              </span>
                              {isAnswered && (
                                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-xs flex items-center space-x-1 ${
                                  currentAnswer === 'richtig'
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : 'bg-rose-100 text-rose-900 border-rose-300'
                                }`}>
                                  <span>{currentAnswer === 'richtig' ? '✓ Richtig (+)' : '✕ Falsch (-)'}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-base sm:text-lg font-bold text-slate-950 leading-snug mt-2">
                              {q.statement}
                            </p>
                          </div>
                        </div>

                        {/* Richtig / Falsch Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onSelectAnswer(q.id, 'richtig')}
                            disabled={isSubmitted}
                            className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
                              currentAnswer === 'richtig'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50 scale-[1.01]'
                                : 'bg-white hover:bg-emerald-50/50 text-slate-900 hover:text-emerald-900 border-slate-300 hover:border-emerald-500 shadow-xs'
                            }`}
                          >
                            <Check className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'richtig' ? 'text-white' : 'text-emerald-600'}`} />
                            <span>Richtig (+)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectAnswer(q.id, 'falsch')}
                            disabled={isSubmitted}
                            className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
                              currentAnswer === 'falsch'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50 scale-[1.01]'
                                : 'bg-white hover:bg-rose-50/50 text-slate-900 hover:text-rose-900 border-slate-300 hover:border-rose-500 shadow-xs'
                            }`}
                          >
                            <X className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'falsch' ? 'text-white' : 'text-rose-600'}`} />
                            <span>Falsch (-)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-blue-50/80 border border-blue-200 text-blue-950 text-xs sm:text-sm font-medium rounded-xl p-3 flex items-center justify-center space-x-2 shadow-xs">
                  <HelpCircle className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  <span>Перечитайте текст слева при сомнениях перед выбором ответа</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
