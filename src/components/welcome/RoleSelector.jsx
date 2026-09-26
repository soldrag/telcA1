import React from 'react';
import { GraduationCap, Briefcase, ChevronDown } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useWelcomeRole } from '../../hooks/useWelcomeRole.js';

const ROLE_OPTIONS = [
  { id: 'student', icon: GraduationCap },
  { id: 'teacher', icon: Briefcase },
];

// Phones: a compact native dropdown ("Ученик ▾") keeps the one-row header.
function RoleDropdown({ activeRole, selectRole, t }) {
  return (
    <label className="sm:hidden relative">
      <span className="sr-only">{t('welcome.roles.label')}</span>
      <select
        value={activeRole}
        onChange={(event) => selectRole(event.target.value)}
        className="appearance-none min-h-[44px] pl-3 pr-8 rounded-xl border border-border-default bg-surface-card text-sm font-semibold text-content-primary cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
      >
        {ROLE_OPTIONS.map(({ id }) => <option key={id} value={id}>{t(`welcome.roles.${id}`)}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-secondary" aria-hidden="true" />
    </label>
  );
}

function RoleSegments({ activeRole, selectRole, t }) {
  return (
    <div role="group" aria-label={t('welcome.roles.label')} className="hidden sm:flex items-center gap-0.5 p-0.5 bg-surface-inset rounded-xl border border-border-default shrink-0">
      {ROLE_OPTIONS.map(({ id, icon: Icon }) => {
        const isActive = activeRole === id;
        const label = t(`welcome.roles.${id}`);
        return (
          <button
            key={id}
            type="button"
            onClick={() => selectRole(id)}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
            className={`min-h-[40px] min-w-[40px] px-2 lg:px-3 rounded-lg flex items-center justify-center gap-1.5 text-sm whitespace-nowrap cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
              isActive ? 'bg-surface-card text-content-primary font-semibold shadow-xs' : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function RoleSelector() {
  const { t } = useI18n();
  const { activeRole, selectRole } = useWelcomeRole();
  return (
    <>
      <RoleDropdown activeRole={activeRole} selectRole={selectRole} t={t} />
      <RoleSegments activeRole={activeRole} selectRole={selectRole} t={t} />
    </>
  );
}
