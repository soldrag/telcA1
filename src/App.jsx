import React from 'react';
import Header from './components/Header.jsx';
import AppScreens from './components/AppScreens.jsx';
import AppModals from './components/modals/AppModals.jsx';
import AppErrorBanner from './components/AppErrorBanner.jsx';
import { useAppController } from './hooks/useAppController.js';
import { useTheme } from './hooks/useTheme.js';
import { useI18n } from './i18n/I18nContext.jsx';
import { buildHeaderConfig, buildScreenProps } from './utils/appPropsBuilder.js';

export default function App() {
  const controller = useAppController();
  const themeControl = useTheme();
  const { t } = useI18n();
  const headerConfig = buildHeaderConfig(controller);
  const screenProps = buildScreenProps(controller);

  return (
    <div className="min-h-screen flex flex-col bg-bg-canvas font-sans transition-colors duration-200">
      <Header {...headerConfig} themeControl={themeControl} />

      <AppErrorBanner
        message={controller.errorMessage}
        onDismiss={controller.dismissError}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
          totalQuestions: controller.examData?.questions?.length || 15,
          isSubmitting: controller.session.isSubmitting,
        }}
      />

      <footer className="mt-auto border-t border-border-subtle bg-surface-card py-4 text-center text-xs text-content-tertiary">
        <p>{t('footer.text')}</p>
        <p className="mt-1 opacity-70">{t('footer.privacy')}</p>
      </footer>
    </div>
  );
}
