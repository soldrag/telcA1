import React from 'react';
import { Eye } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { formatExamName } from '../../utils/examFormat.js';

export default function InspectionInfoCard({ examTitle, examId }) {
  const { t } = useI18n();
  const displayName = examTitle || (examId ? formatExamName(examId) : '');

  return (
    <Card className="p-4 shadow-xs bg-action-primary-subtle border-action-primary-border">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-action-primary text-white shrink-0">
          <Eye className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5">
              {t('exam.inspectionBadge')}
            </Badge>
          </div>
          <h3 className="text-base font-bold text-content-primary truncate mt-0.5">
            {displayName}
          </h3>
          <p className="text-xs text-content-secondary truncate">
            {t('exam.inspectionDesc')}
          </p>
        </div>
      </div>
    </Card>
  );
}
