import React from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AppScreens from './components/AppScreens.jsx';
import AppModals from './components/modals/AppModals.jsx';
import AppErrorBanner from './components/AppErrorBanner.jsx';
import { useAppController } from './hooks/useAppController.js';
import { useTheme } from './hooks/useTheme.js';
import { buildHeaderConfig, buildScreenProps } from './utils/appPropsBuilder.js';

export default function App() {
  const controller = useAppController();
  const themeControl = useTheme();
  const headerConfig = buildHeaderConfig(controller);
  const screenProps = buildScreenProps(controller);

  return (
    <div className="min-h-screen flex flex-col bg-bg-canvas font-sans transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      <Header {...headerConfig} themeControl={themeControl} />

      <AppErrorBanner
        message={controller.errorMessage}
        onDismiss={controller.dismissError}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 min-w-0 overflow-hidden sm:overflow-visible">
        <AppScreens
          screen={controller.screen}
          screenProps={screenProps}
        />
      </main>

      <AppModals
        modals={controller.modals}
        actions={{
          onConfirmSubmit: controller.submitExam,
          onConfirmLeave: controller.leaveExam,
          onConfirmTimeUp: controller.submitExam,
        }}
        stats={{
          answeredCount: controller.session.answeredCount,
          totalQuestions: controller.examData?.questions?.length || 0,
          isSubmitting: controller.session.isSubmitting,
        }}
      />

      <Footer onOpenLegalModal={controller.modals.openLegalModal} />
    </div>
  );
}
