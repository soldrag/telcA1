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
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn py-3">
      <TestTypeSelector testTypes={testTypes} activeTypeId={activeTestType} onSelectType={actions.onSelectTestType} />
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
