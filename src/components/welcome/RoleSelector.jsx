import React from 'react';
import { GraduationCap, Briefcase } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function RoleSelector({ activeRole = 'student', onRoleChange }) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center p-1 bg-surface-inset rounded-2xl border border-border-default max-w-md mx-auto">
      <button
        type="button"
        onClick={() => onRoleChange('student')}
        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] cursor-pointer ${
          activeRole === 'student'
            ? 'bg-surface-card text-action-primary shadow-sm border border-border-default'
            : 'text-content-secondary hover:text-content-primary'
        }`}
      >
        <GraduationCap className="w-4 h-4" />
        <span>{t('welcome.roles.student')}</span>
      </button>

      <button
        type="button"
        onClick={() => onRoleChange('teacher')}
        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] cursor-pointer ${
          activeRole === 'teacher'
            ? 'bg-surface-card text-action-primary shadow-sm border border-border-default'
            : 'text-content-secondary hover:text-content-primary'
        }`}
      >
        <Briefcase className="w-4 h-4" />
        <span>{t('welcome.roles.teacher')}</span>
      </button>
    </div>
  );
}
