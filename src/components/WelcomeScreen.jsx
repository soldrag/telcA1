import React from 'react';
import TestTypeSelector from './welcome/TestTypeSelector.jsx';
import StudentWelcomeView from './welcome/StudentWelcomeView.jsx';
import TeacherWelcomeView from './welcome/TeacherWelcomeView.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useWelcomeRole } from '../hooks/useWelcomeRole.js';
import { getTestTypeById } from '../../shared/testTypes.js';

export default function WelcomeScreen({
  examState = {},
  navigation = {},
  actions = {},
  onOpenCreateAssignment,
  onProcessReview,
  onOpenTask,
}) {
  const { t } = useI18n();
  const { activeRole } = useWelcomeRole();
  const { testTypes = [], activeTestType = 'lesen' } = examState;
  const currentModule = testTypes.find((item) => item.id === activeTestType) || getTestTypeById(activeTestType);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* From 1024 px the module switch sits in the header as tabs. */}
      <div className="lg:hidden">
        <TestTypeSelector testTypes={testTypes} activeTypeId={activeTestType} onSelectType={actions.onSelectTestType} />
      </div>
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
          title={t('welcome.roles.teacher')}
          examState={examState}
          actions={actions}
          onOpenCreateAssignment={onOpenCreateAssignment}
          onProcessReview={onProcessReview}
        />
      )}
    </div>
  );
}
