import React, { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { parseReviewTokenFromUrl } from '../../../services/shareTokenService.js';

export default function QuickReviewInputCard({ onProcessReview }) {
  const { t } = useI18n();
  const [reviewInput, setReviewInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = reviewInput.trim();
    if (!clean) return;
    const token = parseReviewTokenFromUrl(clean) || clean.replace(/^#review=/, '');
    if (token) {
      onProcessReview?.(token);
    }
  };

  return (
    <div className="bg-surface-card border border-border-default rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-action-primary-subtle text-action-primary flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-content-primary">
            {t('welcome.teacherSpace.quickReviewTitle')}
          </h3>
          <p className="text-xs text-content-secondary">
            {t('welcome.teacherSpace.quickReviewDesc')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={reviewInput}
          onChange={(e) => setReviewInput(e.target.value)}
          placeholder={t('welcome.teacherSpace.quickReviewPlaceholder')}
          className="flex-1 px-4 py-2.5 rounded-xl bg-surface-raised border border-border-default text-content-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-action-primary"
        />
        <button
          type="submit"
          disabled={!reviewInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-action-primary hover:bg-action-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5 min-h-[44px] shrink-0 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t('welcome.teacherSpace.quickReviewBtn')}</span>
        </button>
      </form>
    </div>
  );
}
