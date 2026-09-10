import React from 'react';
import { BookOpen, Headphones, PenTool, MessageSquare } from 'lucide-react';

const TYPE_ICONS = {
  lesen: BookOpen,
  hoeren: Headphones,
  schreiben: PenTool,
  sprechen: MessageSquare,
};

export default function TestTypeSelector({
  testTypes = [],
  activeTypeId = 'lesen',
  onSelectType,
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary">
        Выберите раздел экзамена
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {testTypes.map((type) => {
          const Icon = TYPE_ICONS[type.id] || BookOpen;
          const isActive = activeTypeId === type.id;
          const isAvailable = (type.status === 'active' || type.id === 'lesen') && type.status !== 'upcoming';

          if (!isAvailable) {
            return (
              <div
                key={type.id}
                aria-disabled="true"
                className="p-3 rounded-2xl border border-border-subtle bg-surface-inset text-content-muted select-none flex flex-col justify-between min-h-[44px] cursor-not-allowed opacity-75"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2 rounded-xl bg-surface-card text-content-muted">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-card text-content-tertiary">
                    Скоро
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-bold text-content-tertiary">{type.title}</div>
                  <div className="text-xs text-content-muted">{type.titleRu}</div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelectType(type.id)}
              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-telc-600 bg-telc-50/70 dark:bg-telc-950/60 text-content-primary shadow-sm ring-2 ring-telc-500/20'
                  : 'border-border-default bg-surface-card hover:border-slate-300 text-content-secondary hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl ${isActive ? 'bg-telc-600 text-white' : 'bg-surface-inset text-content-secondary'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-telc-100 dark:bg-telc-950 text-telc-800 dark:text-telc-200' : 'bg-surface-inset text-content-tertiary'
                }`}>
                  10 вариантов
                </span>
              </div>

              <div className="mt-2">
                <div className="text-sm font-extrabold">{type.title}</div>
                <div className="text-xs text-content-tertiary">{type.titleRu}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
