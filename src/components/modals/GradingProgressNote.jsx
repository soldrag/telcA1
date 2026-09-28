import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { GRADING_STAGES } from '../../services/ai/types.js';

/**
 * While the letter grading downloads the AI model (the first grading only), says so and how much has
 * arrived, so a long first submission does not look frozen. Nothing in any other stage.
 */
export default function GradingProgressNote({ gradingProgress }) {
  const { t } = useI18n();
  if (gradingProgress?.stage !== GRADING_STAGES.MODEL_DOWNLOAD) return null;
  const megabytes = Math.floor((gradingProgress.loadedBytes || 0) / 1e6);

  return (
    <p role="status" aria-live="polite" className="text-xs text-content-secondary mt-3 leading-relaxed">
      {t('modals.modelDownloading', { megabytes })}
    </p>
  );
}
