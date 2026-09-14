import React, { useState } from 'react';
import ModuleStructureCards from './welcome/ModuleStructureCards.jsx';
import RoleSelector from './welcome/RoleSelector.jsx';
import StudentWelcomeView from './welcome/StudentWelcomeView.jsx';
import TeacherWelcomeView from './welcome/TeacherWelcomeView.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { getTestTypeById } from '../../shared/testTypes.js';

const ROLE_STORAGE_KEY = 'telc_welcome_role';

function getInitialRole() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
      if (stored === 'student' || stored === 'teacher') return stored;
    } catch {
      return 'student';
    }
  }
  return 'student';
}

export default function WelcomeScreen({
  examState = {},
  navigation = {},
  actions = {},
  onOpenCreateAssignment,
  onProcessReview,
  onOpenTask,
}) {
  const { t } = useI18n();
  const [activeRole, setActiveRole] = useState(getInitialRole);

  const {
    testTypes = [],
    activeTestType = 'lesen',
  } = examState;

  const currentModule = testTypes.find((item) => item.id === activeTestType)
    || getTestTypeById(activeTestType);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(ROLE_STORAGE_KEY, role);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn py-3">
      <div className="bg-gradient-to-br from-slate-900 via-telc-900 to-telc-800 rounded-3xl p-6 sm:p-9 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm border border-white/20 text-telc-200">
            <span>{t('welcome.badge')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {t('welcome.title')} <span className="text-sky-300">{currentModule.title}</span> ({t(`welcome.moduleSubtitle_${currentModule.id}`)})
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {t(`welcome.moduleDesc_${currentModule.id}`)}
          </p>
        </div>

        <ModuleStructureCards testType={activeTestType} />
      </div>

      <RoleSelector activeRole={activeRole} onRoleChange={handleRoleChange} />

      {activeRole === 'student' ? (
        <StudentWelcomeView
          examState={examState}
          navigation={navigation}
          actions={actions}
          currentModule={currentModule}
          onOpenTask={onOpenTask}
        />
      ) : (
        <TeacherWelcomeView
          examState={examState}
          actions={actions}
          onOpenCreateAssignment={onOpenCreateAssignment}
          onProcessReview={onProcessReview}
        />
      )}
    </div>
  );
}
