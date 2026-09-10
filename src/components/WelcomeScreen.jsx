import React from 'react';
import TestTypeSelector from './welcome/TestTypeSelector.jsx';
import ModuleStructureCards from './welcome/ModuleStructureCards.jsx';
import RandomExamCard from './welcome/RandomExamCard.jsx';
import TeacherExamPicker from './welcome/TeacherExamPicker.jsx';
import RecentAttemptsList from './welcome/RecentAttemptsList.jsx';

export default function WelcomeScreen({
  examState = {},
  navigation = {},
  actions = {},
}) {
  const {
    exams = [],
    testTypes = [],
    activeTestType = 'lesen',
    currentExamId,
    recentAttempts = [],
  } = examState;

  const {
    onSelectTestType,
    onSelectExam,
    onStartExam,
    onStartRandomExam,
    onLoadAttempt,
  } = actions;

  const { onOpenHistory } = navigation;

  const currentModule = testTypes.find(testTypeItem => testTypeItem.id === activeTestType) || {
    id: 'lesen',
    title: 'Lesen',
    titleRu: 'Чтение',
    timeLimitMinutes: 25,
    passScore: 9,
    totalQuestions: 15,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 animate-fadeIn py-3">
      <div className="bg-gradient-to-br from-slate-900 via-telc-900 to-telc-800 rounded-3xl p-6 sm:p-9 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm border border-white/20 text-telc-200">
            <span>🇩🇪 telc Deutsch A1 / Start Deutsch 1</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Симулятор экзамена: <span className="text-sky-300">{currentModule.title}</span> ({currentModule.titleRu})
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {currentModule.description || 'Тренировка официального формата экзамена telc Deutsch A1 с автоматической проверкой.'}
          </p>
        </div>

        <ModuleStructureCards testType={activeTestType} />
      </div>

      <TestTypeSelector
        testTypes={testTypes}
        activeTypeId={activeTestType}
        onSelectType={onSelectTestType}
      />

      <RandomExamCard
        onStartRandomExam={onStartRandomExam}
        attemptsCount={recentAttempts.length}
        moduleInfo={currentModule}
      />

      <TeacherExamPicker
        exams={exams}
        currentExamId={currentExamId}
        onSelectExam={onSelectExam}
        onStartExam={onStartExam}
      />

      <RecentAttemptsList
        recentAttempts={recentAttempts}
        onOpenHistory={onOpenHistory}
        onLoadAttempt={onLoadAttempt}
      />
    </div>
  );
}
