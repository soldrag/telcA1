import React, { useState } from 'react';
import { ArrowRight, Link2 } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { parseAssignmentTokenFromUrl } from '../../../services/assignmentTokenService.js';

export default function EnterTaskCard({ onOpenTask }) {
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
    <div className="bg-surface-card border border-border-default rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-action-primary-subtle text-action-primary flex items-center justify-center shrink-0">
          <Link2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-content-primary">
            {t('welcome.studentSpace.enterTaskTitle')}
          </h3>
          <p className="text-xs text-content-secondary">
            {t('welcome.studentSpace.enterTaskDesc')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder={t('welcome.studentSpace.enterTaskPlaceholder')}
          className="flex-1 px-4 py-2.5 rounded-xl bg-surface-raised border border-border-default text-content-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-action-primary"
        />
        <button
          type="submit"
          disabled={!taskInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-action-primary hover:bg-action-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5 min-h-[44px] shrink-0 cursor-pointer"
        >
          <span>{t('welcome.studentSpace.enterTaskBtn')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
