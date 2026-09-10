import React from 'react';

export default function Teil2WebpageOption({
  option,
  isSelected,
  isSubmitted,
  onSelect,
}) {
  const containerClass = isSelected
    ? 'border-telc-600 bg-telc-50/70 dark:bg-telc-950/50 shadow-lg ring-2 ring-telc-500/30 scale-[1.01]'
    : 'border-border-default hover:border-slate-400 bg-surface-card hover:bg-slate-50/70 dark:hover:bg-slate-700/50 shadow-xs';

  return (
    <button
      type="button"
      onClick={() => !isSubmitted && onSelect(option.id)}
      className={`text-left w-full min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 relative flex flex-col justify-between rounded-2xl border-2 p-4 sm:p-6 transition-all cursor-pointer ${containerClass}`}
    >
      <div>
        {/* Browser mockup header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-border-subtle">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black flex items-center justify-center flex-shrink-0 shadow-xs">
              {option.id.toUpperCase()}
            </span>
            <span className="text-xs font-mono font-bold text-content-secondary truncate max-w-[200px] sm:max-w-xs bg-surface-inset px-3 py-1 rounded border border-border-subtle">
              {option.badge}
            </span>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
        </div>

        <h4 className="text-base sm:text-lg font-black text-content-primary hover:text-telc-600 dark:hover:text-telc-400 transition-colors">
          {option.title}
        </h4>

        <p className="mt-2 text-sm sm:text-base text-content-primary leading-relaxed font-normal">
          {option.text}
        </p>

        {option.details && (
          <div className="mt-4 inline-block text-xs font-bold text-content-secondary bg-surface-inset px-3 py-1 rounded-lg border border-border-default shadow-xs">
            {option.details}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t-2 border-border-subtle">
        <div
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-between text-sm font-black transition-all border-2 min-h-[48px] ${
            isSelected
              ? 'bg-telc-600 border-telc-700 text-white shadow-md'
              : 'bg-surface-inset hover:bg-telc-50 dark:hover:bg-telc-950/60 text-content-primary border-border-default hover:border-telc-400 shadow-xs'
          }`}
        >
          <span>
            {isSelected
              ? `✓ Выбрана веб-страница [${option.id.toUpperCase()}]`
              : `Выбрать веб-страницу [${option.id.toUpperCase()}]`}
          </span>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              isSelected
                ? 'bg-white text-telc-700 shadow-xs'
                : 'border-2 border-slate-400 text-transparent'
            }`}
          >
            ✓
          </div>
        </div>
      </div>
    </button>
  );
}
