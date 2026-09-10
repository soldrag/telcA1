import React, { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle2, XCircle, RotateCcw, Calendar, ChevronRight, Download, Eye, Award, Trash2, ShieldCheck } from 'lucide-react';

export default function HistoryView({
  onBack,
  onLoadAttempt,
  onStartExam,
  onClearHistory,
  attempts = [],
  loading = false,
  onRefresh,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const getExamTitle = (title) => {
    if (!title) return 'Modellsatz';
    return title.replace('telc Deutsch A1 — ', '');
  };

  const getPassRate = () => {
    if (!attempts || attempts.length === 0) return 0;
    const passed = attempts.filter(a => a.passed).length;
    return Math.round((passed / attempts.length) * 100);
  };

  const getAverageScore = () => {
    if (!attempts || attempts.length === 0) return 0;
    const total = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
    return Math.round(total / attempts.length);
  };

  const handleConfirmClear = () => {
    if (onClearHistory) {
      onClearHistory();
    }
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Spacer */}
      <div className="h-16"></div>
      
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm sm:text-base">Назад</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <h1 className="text-sm font-bold text-slate-900">Моя статистика</h1>
            <p className="text-xs text-slate-500">Результаты экзаменов</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-telc-100 flex items-center justify-center text-telc-700 hidden sm:flex">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="p-2 sm:p-3 bg-blue-50 text-blue-600 rounded-xl mb-3">
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{attempts.length}</div>
            <div className="text-xs text-slate-500 mt-1">Всего попыток</div>
          </div>
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-3">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{getPassRate()}%</div>
            <div className="text-xs text-slate-500 mt-1">Успешность</div>
          </div>
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="p-2 sm:p-3 bg-purple-50 text-purple-600 rounded-xl mb-3">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{getAverageScore()}%</div>
            <div className="text-xs text-slate-500 mt-1">Средний балл</div>
          </div>
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="p-2 sm:p-3 bg-orange-50 text-orange-600 rounded-xl mb-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {attempts.length > 0 ? 
                Math.round(attempts.reduce((acc, a) => acc + a.time_spent_seconds, 0) / attempts.length / 60) : 0}
              <span className="text-sm ml-1 text-slate-500">мин</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Ср. время</div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Вся история и разборы хранятся исключительно в памяти вашего браузера. Сервер не сохраняет ваши результаты.</span>
          </div>
        </div>

        {/* History List Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <h2 className="text-xl font-bold text-slate-900">История тестов</h2>
          <div className="flex items-center space-x-2">
            {attempts.length > 0 && (
              <>
                {showClearConfirm ? (
                  <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 rounded-xl p-1 px-2 text-xs">
                    <span className="text-rose-800 font-semibold">Удалить всё?</span>
                    <button
                      type="button"
                      onClick={handleConfirmClear}
                      className="px-2 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
                    >
                      Да, очистить
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-rose-600 font-semibold px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[36px]"
                    title="Очистить историю браузера"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Очистить историю</span>
                  </button>
                )}
              </>
            )}
            <button 
              type="button"
              onClick={onRefresh}
              className="flex items-center space-x-1 text-xs text-telc-600 hover:text-telc-700 font-semibold px-3 py-2 rounded-lg hover:bg-telc-50 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Обновить</span>
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-5 bg-slate-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-slate-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">История пуста</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Вы ещё не завершили ни одного экзамена. Пройдите свой первый тест, чтобы увидеть результаты здесь.
              </p>
              <button
                type="button"
                onClick={onStartExam}
                className="px-6 py-3 bg-telc-600 text-white font-bold rounded-xl hover:bg-telc-700 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
              >
                Начать экзамен
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {attempts.map((att) => {
                const minutes = Math.floor(att.time_spent_seconds / 60);
                const seconds = att.time_spent_seconds % 60;
                const dateStr = new Date(att.created_at + 'Z').toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <button
                    type="button"
                    key={att.id}
                    onClick={() => onLoadAttempt(att.id)}
                    className="w-full text-left p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px]"
                  >
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                      <div className="flex-shrink-0">
                        {att.passed ? (
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
                            <XCircle className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-base font-bold text-slate-900 truncate">
                            {getExamTitle(att.exam_title)}
                          </span>
                          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                            att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {att.passed ? 'Сдано' : 'Не сдано'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{dateStr}</span>
                          </span>
                          <span className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{minutes}м {seconds}с</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pl-16 sm:pl-0">
                      <div className="text-left sm:text-right mr-4 sm:mr-6">
                        <div className="text-lg font-black text-slate-900">
                          {att.score} <span className="text-sm font-medium text-slate-500">/ {att.total_questions}</span>
                        </div>
                        <div className={`text-sm font-bold ${att.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {att.percentage}%
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-telc-50 group-hover:text-telc-600 group-hover:border-telc-200 transition-all">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
