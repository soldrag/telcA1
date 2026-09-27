import React from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AppScreens from './components/AppScreens.jsx';
import AppModals from './components/modals/AppModals.jsx';
import AppErrorBanner from './components/AppErrorBanner.jsx';
import MobileTabBar from './components/nav/MobileTabBar.jsx';
import { PAGE_CONTAINER, SCREEN_COLUMN } from './components/layout/pageLayout.js';
import { useAppController } from './hooks/useAppController.js';
import { useTheme } from './hooks/useTheme.js';
import { buildHeaderConfig, buildScreenProps } from './utils/appPropsBuilder.js';

export default function App() {
  const controller = useAppController();
  const themeControl = useTheme();
  const headerConfig = buildHeaderConfig(controller);
  const screenProps = buildScreenProps(controller);

  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-bg-canvas font-sans transition-colors duration-200 w-full max-w-full overflow-x-clip">
      <Header {...headerConfig} themeControl={themeControl} />

      <AppErrorBanner
        message={controller.errorMessage}
        onDismiss={controller.dismissError}
      />

      {/* overflow-x-clip (not hidden) keeps sticky bars inside the page working on phones */}
      <main className={`flex-1 ${PAGE_CONTAINER} py-6 min-w-0 overflow-x-clip`}>
        <div className={`${SCREEN_COLUMN} space-y-6`}>
          <AppScreens
            screen={controller.screen}
            screenProps={screenProps}
          />
        </div>
      </main>

      <AppModals
        modals={controller.modals}
        actions={{
          onConfirmSubmit: controller.submitExam,
          onConfirmLeave: controller.leaveExam,
          onConfirmTimeUp: controller.modals.closeTimeUpModal,
        }}
        stats={{
          answeredCount: controller.session.answeredCount,
          totalQuestions: controller.examData?.questions?.length || 0,
          isSubmitting: controller.session.isSubmitting,
        }}
      />

      <Footer onOpenLegalModal={controller.modals.openLegalModal} />

      <MobileTabBar
        screen={controller.screen}
        onNavigateHome={controller.navigateHome}
        onOpenHistory={controller.openHistory}
        themeControl={themeControl}
      />
    </div>
  );
}
