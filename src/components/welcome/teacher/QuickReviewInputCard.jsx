import React, { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { parseReviewTokenFromUrl } from '../../../services/shareTokenService.js';

/**
 * Paste a #review= link from a student to open their result.
 */
export default function QuickReviewInputCard({ onProcessReview }) {
  const { t } = useI18n();
  const [reviewInput, setReviewInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = reviewInput.trim();
    if (!clean) return;
    const token = parseReviewTokenFromUrl(clean) || clean.replace(/^#review=/, '');
    if (token) onProcessReview?.(token);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-surface-card border border-border-default p-4 space-y-2">
      <label htmlFor="review-link-input" className="block text-sm font-semibold text-content-secondary">
        {t('welcome.teacherSpace.quickReviewDesc')}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="review-link-input"
          type="text"
          value={reviewInput}
          onChange={(e) => setReviewInput(e.target.value)}
          placeholder={t('welcome.teacherSpace.quickReviewPlaceholder')}
          autoComplete="off"
          className="flex-1 min-w-0 min-h-[3rem] px-4 rounded-xl bg-surface-card border border-border-default text-content-primary text-base sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
        />
        <button
          type="submit"
          disabled={!reviewInput.trim()}
          className="min-h-[3rem] px-5 rounded-xl bg-action-primary hover:bg-action-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold whitespace-nowrap cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          {t('welcome.teacherSpace.quickReviewBtn')}
        </button>
      </div>
    </form>
  );
}
