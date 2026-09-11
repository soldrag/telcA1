import React from 'react';
import { Headphones, PenTool, MessageSquare, Clock, Award, Sparkles } from 'lucide-react';
import { Dialog } from '../ui/Dialog.jsx';
import { Button } from '../ui/Button.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

const MODULE_ICONS = {
  hoeren: Headphones,
  schreiben: PenTool,
  sprechen: MessageSquare,
};

export default function TestTypeStubModal({ testType, isOpen, onClose }) {
  const { t, isRussian } = useI18n();
  if (!testType) return null;

  const Icon = MODULE_ICONS[testType.id] || Sparkles;
  const moduleSub = isRussian ? (testType.titleRu || '') : '';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-state-warning-subtle text-state-warning flex items-center justify-center border border-state-warning-border">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-extrabold bg-state-warning-subtle text-state-warning-text border border-state-warning-border uppercase tracking-wide">
            <span>{t('modals.stubTitle')}</span>
          </div>
          <h3 className="text-xl font-bold text-content-primary mt-1">
            telc A1 — {testType.title} {moduleSub ? `(${moduleSub})` : ''}
          </h3>
        </div>
      </div>

      <p className="text-sm text-content-secondary leading-relaxed">
        {t('modals.stubDesc', { title: testType.title })}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-5 p-4 bg-surface-inset rounded-2xl border border-border-default text-xs">
        <div className="flex items-center space-x-2 text-content-secondary">
          <Clock className="w-4 h-4 text-content-muted" />
          <span>Время: <strong className="text-content-primary">{testType.timeLimitMinutes} минут</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-content-secondary">
          <Award className="w-4 h-4 text-content-muted" />
          <span>Баллы: <strong className="text-content-primary">{testType.maxScore} баллов</strong></span>
        </div>
      </div>

      <div className="mt-5 p-4 bg-state-info-subtle rounded-2xl border border-state-info-border text-xs text-state-info-text leading-relaxed">
        💡 Аутентичные задания и интерактивный тренажёр для этого модуля готовятся к публикации. Сейчас вам доступен полноценный модуль <strong>Lesen (Чтение)</strong> из 10 вариантов.
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="default"
          size="default"
          onClick={onClose}
          className="min-h-[44px]"
        >
          {t('modals.stubClose')}
        </Button>
      </div>
    </Dialog>
  );
}
