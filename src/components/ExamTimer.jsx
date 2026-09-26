import React from 'react';
import { Pause, Play } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';

const CRITICAL_SECONDS = 5 * 60;
const FINAL_SECONDS = 60;

function formatTimeDisplay(totalSecs) {
  const safeSeconds = Math.max(0, totalSecs);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Screen readers hear the time only at the 5- and 1-minute marks, never every second.
function resolveMilestoneAnnouncement(secondsLeft, t) {
  if (secondsLeft <= 0) return '';
  if (secondsLeft <= FINAL_SECONDS) return t('timer.oneMinuteLeft');
  if (secondsLeft <= CRITICAL_SECONDS) return t('timer.fiveMinutesLeft');
  return '';
}

function PauseToggle({ isPaused, togglePause, t }) {
  const label = isPaused ? t('timer.resumeTitle') : t('timer.pauseTitle');
  return (
    <button
      type="button"
      onClick={togglePause}
      title={label}
      aria-label={label}
      aria-pressed={isPaused}
      className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
        isPaused ? 'bg-state-warning text-white' : 'text-content-secondary hover:bg-surface-raised'
      }`}
    >
      {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
    </button>
  );
}

export default function ExamTimer({ timer, isSubmitted = false }) {
  const { t } = useI18n();
  if (!timer) return null;

  if (!timer.isTimed) {
    return (
      <span className="font-mono-num text-base font-semibold text-content-secondary tabular-nums" title={t('timer.practiceMode')}>
        {formatTimeDisplay(timer.secondsElapsed)}
      </span>
    );
  }

  const { secondsLeft, totalSeconds, isPaused, togglePause } = timer;
  const isCritical = secondsLeft <= CRITICAL_SECONDS;

  return (
    <div className="flex items-center gap-1 shrink-0">
      <span
        className={`font-mono-num text-lg sm:text-xl font-semibold tabular-nums ${isCritical ? 'text-state-error' : 'text-content-primary'}`}
        title={t('timer.timeLimit', { limit: formatTimeDisplay(totalSeconds) })}
      >
        {formatTimeDisplay(secondsLeft)}
      </span>
      {!isSubmitted && <PauseToggle isPaused={isPaused} togglePause={togglePause} t={t} />}
      <span role="status" className="sr-only">{resolveMilestoneAnnouncement(secondsLeft, t)}</span>
    </div>
  );
}
