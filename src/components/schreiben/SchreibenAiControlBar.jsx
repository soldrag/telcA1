import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SchreibenAiControlBar({ aiLoading }) {
  const { t } = useI18n();

  return (
    <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-1.5 text-xs text-content-secondary">
        {aiLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-action-primary animate-spin flex-shrink-0" />
        ) : (
          <Zap className="w-3.5 h-3.5 text-action-primary flex-shrink-0" />
        )}
        <span className="font-semibold text-content-primary">
          {aiLoading ? t('results.aiCheckLoading') : t('results.aiRankerEvaluated')}
        </span>
      </div>
    </div>
  );
}
