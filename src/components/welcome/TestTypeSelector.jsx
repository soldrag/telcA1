import React from 'react';
import { BookOpen, Headphones, PenTool, MessageSquare } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

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
  const { isRussian } = useI18n();

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary">
        {isRussian ? 'Выберите раздел экзамена' : 'Select exam module'}
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
                    {isRussian ? 'Скоро' : 'Coming soon'}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-bold text-content-tertiary">{type.title}</div>
                  <div className="text-xs text-content-muted">{isRussian ? type.titleRu : ''}</div>
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
                  ? 'border-action-primary bg-action-primary-subtle text-content-primary shadow-xs ring-2 ring-action-primary/20'
                  : 'border-border-default bg-surface-card hover:border-border-strong text-content-secondary hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl ${isActive ? 'bg-action-primary text-white' : 'bg-surface-inset text-content-secondary'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-action-primary-subtle text-action-primary border border-action-primary-border' : 'bg-surface-inset text-content-tertiary'
                }`}>
                  {isRussian ? '10 вариантов' : '10 variants'}
                </span>
              </div>

              <div className="mt-2">
                <div className="text-sm font-extrabold">{type.title}</div>
                <div className="text-xs text-content-tertiary">{isRussian ? type.titleRu : ''}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
