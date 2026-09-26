import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { parseAssignmentTokenFromUrl } from '../../../services/assignmentTokenService.js';

// compact: the label is only for screen readers (the surrounding card already says what the field is for),
// and the submit button carries its text.
export default function EnterTaskCard({ onOpenTask, compact = false }) {
  const { t } = useI18n();
  const [taskInput, setTaskInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = taskInput.trim();
    if (!clean) return;
    const parsed = parseAssignmentTokenFromUrl(clean) || clean.replace(/^#task=/, '');
    if (parsed) {
      onOpenTask?.(parsed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="enter-task-input" className={compact ? 'sr-only' : 'block text-sm text-content-secondary'}>
        {t('welcome.studentSpace.enterTaskTitle')}
      </label>
      <div className="flex gap-2">
        <input
          id="enter-task-input"
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder={t('welcome.studentSpace.enterTaskPlaceholder')}
          className="flex-1 min-w-0 min-h-[2.75rem] px-3 rounded-xl bg-surface-card border border-border-default text-content-primary text-sm focus:outline-none focus:ring-2 focus:ring-action-primary"
        />
        <button
          type="submit"
          disabled={!taskInput.trim()}
          aria-label={t('welcome.studentSpace.enterTaskBtn')}
          title={t('welcome.studentSpace.enterTaskBtn')}
          className="min-h-[2.75rem] min-w-[2.75rem] px-3 rounded-xl border border-border-default bg-surface-card hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed text-content-primary flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
        >
          {compact && <span className="mr-1.5 text-sm font-semibold">{t('welcome.studentSpace.openBtn')}</span>}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
