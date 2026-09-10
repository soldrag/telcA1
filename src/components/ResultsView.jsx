import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, Award, Clock, ArrowRight, RotateCcw, 
  HelpCircle, ChevronDown, ChevronUp, BookOpen, AlertTriangle, Filter
} from 'lucide-react';

export default function ResultsView({
  results,
  onResetExam,
  onRetakeMistakes,
  onOpenHistory,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'mistakes' | 'correct'
  const [expandedQuestions, setExpandedQuestions] = useState({});

  if (!results) return null;

  const {
    score,
    totalQuestions,
    passScore,
    percentage,
    passed,
    teilBreakdown,
    reviewItems = [],
    timeSpentSeconds,
    exam
  } = results;

  const mistakesCount = totalQuestions - score;

  const filteredItems = reviewItems.filter(item => {
    if (filter === 'mistakes') return !item.is_correct;
    if (filter === 'correct') return item.is_correct;
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const nextState = {};
    filteredItems.forEach(item => { nextState[item.id] = true; });
    setExpandedQuestions(nextState);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  const minutesSpent = Math.floor(timeSpentSeconds / 60);
  const secondsSpent = timeSpentSeconds % 60;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Score Card */}
      <div className={`rounded-3xl border p-6 sm:p-8 text-white shadow-xl ${
        passed
          ? 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 border-emerald-500/30 shadow-emerald-950/20'
          : 'bg-gradient-to-br from-rose-900 via-slate-900 to-slate-950 border-rose-500/30 shadow-rose-950/20'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm border border-white/20">
              <Award className="w-4 h-4" />
              <span>{exam.title}</span>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {passed ? 'BESTANDEN! (Сдано)' : 'NICHT BESTANDEN (Не сдано)'}
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-200 max-w-xl">
              {passed
                ? 'Отличный результат! Вы успешно преодолели порог 60% в части Leseverstehen экзамена telc Deutsch A1.'
                : 'К сожалению, порог в 60% (9 из 15 баллов) не достигнут. Изучите таблицу ошибок ниже, чтобы разобрать сложные моменты.'}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-4 h-4 text-slate-300" />
                <span>Время: {minutesSpent} мин. {secondsSpent} сек. / 25 мин.</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                <span>Проходной балл: {passScore} из {totalQuestions} (60%)</span>
              </div>
            </div>
          </div>

          {/* Big Score Radial/Badge */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center w-48 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Итоговый балл
            </span>
            <div className="flex items-baseline space-x-1 my-1">
              <span className="text-5xl font-black text-white">{score}</span>
              <span className="text-2xl font-bold text-slate-300">/{totalQuestions}</span>
            </div>
            <div className={`mt-1 text-sm font-extrabold px-3 py-0.5 rounded-full ${
              passed ? 'bg-emerald-400 text-slate-950' : 'bg-rose-400 text-slate-950'
            }`}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* Breakdown by Teile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-slate-300 font-medium">Teil 1: E-Mails / Briefe</div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-white">
                {teilBreakdown?.[1]?.score || 0} / {teilBreakdown?.[1]?.total || 5}
              </span>
              <span className="text-xs text-slate-300">
                {Math.round(((teilBreakdown?.[1]?.score || 0) / (teilBreakdown?.[1]?.total || 5)) * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-slate-300 font-medium">Teil 2: Internet / Webseiten</div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-white">
                {teilBreakdown?.[2]?.score || 0} / {teilBreakdown?.[2]?.total || 5}
              </span>
              <span className="text-xs text-slate-300">
                {Math.round(((teilBreakdown?.[2]?.score || 0) / (teilBreakdown?.[2]?.total || 5)) * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-xs text-slate-300 font-medium">Teil 3: Schilder / Aushänge</div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-white">
                {teilBreakdown?.[3]?.score || 0} / {teilBreakdown?.[3]?.total || 5}
              </span>
              <span className="text-xs text-slate-300">
                {Math.round(((teilBreakdown?.[3]?.score || 0) / (teilBreakdown?.[3]?.total || 5)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={onResetExam}
            className="flex items-center space-x-2 px-4 py-2 bg-telc-600 hover:bg-telc-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Пройти этот тест заново</span>
          </button>

          {mistakesCount > 0 && onRetakeMistakes && (
            <button
              onClick={onRetakeMistakes}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Работа над ошибками ({mistakesCount})</span>
            </button>
          )}
        </div>

        <button
          onClick={onOpenHistory}
          className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-semibold px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          Посмотреть историю попыток
        </button>
      </div>

      {/* Error Table & Review Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-6">
        {/* Filter and Expand controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Таблица результатов и разбор ответов
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Нажмите на задание, чтобы прочитать подробное объяснение на русском языке с цитатой из текста.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Все ({totalQuestions})
              </button>
              <button
                onClick={() => setFilter('mistakes')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
                  filter === 'mistakes'
                    ? 'bg-rose-50 text-rose-700 shadow-sm font-bold border border-rose-200'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <span>Ошибки</span>
                <span className="bg-rose-200 text-rose-800 text-xs px-2 py-1 rounded-full font-extrabold">
                  {mistakesCount}
                </span>
              </button>
              <button
                onClick={() => setFilter('correct')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
                  filter === 'correct'
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                <span>Верно</span>
                <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded-full font-extrabold">
                  {score}
                </span>
              </button>
            </div>

            <button
              onClick={Object.keys(expandedQuestions).length > 0 ? collapseAll : expandAll}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
            >
              {Object.keys(expandedQuestions).length > 0 ? 'Свернуть все' : 'Развернуть все'}
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isExpanded = Boolean(expandedQuestions[item.id]);

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all ${
                  item.is_correct
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
                >
                  <div className="flex items-start sm:items-center space-x-3">
                    {/* Correct / Incorrect icon */}
                    <div className="mt-0.5 sm:mt-0 flex-shrink-0">
                      {item.is_correct ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-extrabold text-sm text-slate-800">
                          Aufgabe {item.question_number}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Teil {item.teil}
                        </span>
                        {!item.is_correct && (
                          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            Ошибка
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium line-clamp-1 sm:line-clamp-none">
                        {item.statement || item.situation}
                      </p>
                    </div>
                  </div>

                  {/* Badges for User vs Correct Answer and Expand toggle */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold">
                      <span className="text-slate-500 hidden md:inline">Ваш ответ:</span>
                      <span className={`px-2 py-1 rounded border uppercase ${
                        item.is_correct
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300 line-through'
                      }`}>
                        {item.user_answer || 'Нет ответа'}
                      </span>

                      {!item.is_correct && (
                        <>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <span className="px-2 py-1 rounded border bg-emerald-600 text-white border-emerald-700 uppercase">
                            {item.correct_answer}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors font-semibold text-xs">
                      <span>Разбор</span>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Explanation Card */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-200/80 bg-white rounded-b-2xl space-y-4">
                    {/* Context / Text excerpt */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-sans text-slate-800 whitespace-pre-line leading-relaxed">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Исходный фрагмент текста:
                      </div>
                      {item.context_body || (
                        item.options_json?.map(opt => (
                          <div key={opt.id} className={`p-2 rounded mb-2 ${opt.id === item.correct_answer ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-100'}`}>
                            <strong>[{opt.id.toUpperCase()}] {opt.title}</strong>
                            <p className="text-xs text-slate-600 mt-0.5">{opt.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Highlighted Clue Quote */}
                    {item.clue_quote && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl">
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                          Ключевая фраза в тексте (Подсказка):
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-amber-950 mt-0.5 italic">
                          «{item.clue_quote}»
                        </div>
                      </div>
                    )}

                    {/* Detailed Russian Explanation */}
                    <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4 text-sky-700" />
                        <span>Почему именно такой ответ? (Разбор на русском)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                        {item.explanation_ru}
                      </p>
                    </div>

                    {/* Vocabulary Notes if present */}
                    {item.vocabulary_notes && item.vocabulary_notes.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Полезные слова уровня A1 из этого задания:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {item.vocabulary_notes.map((voc, vIdx) => (
                            <div key={vIdx} className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                              <span className="font-bold text-slate-900">{voc.word}</span>
                              <span className="text-slate-500 mx-1">—</span>
                              <span className="text-slate-700">{voc.translation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
