import React from 'react';
import { Timer, Pause, Play, Compass } from 'lucide-react';
import { Card } from './ui/Card.jsx';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { Progress } from './ui/Progress.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function ExamTimer({ timer, isSubmitted = false }) {
  const { t } = useI18n();
  if (!timer) return null;

  if (!timer.isTimed) {
    return <UntimedPracticeCard secondsElapsed={timer.secondsElapsed} t={t} />;
  }

  const { secondsLeft, totalSeconds, isPaused, togglePause } = timer;
  const formattedTime = formatTimeDisplay(secondsLeft);
  const isCritical = secondsLeft <= 5 * 60;

  return (
    <Card className="p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${isCritical ? 'bg-state-warning-subtle text-state-warning animate-pulse' : 'bg-surface-inset text-content-secondary'}`}>
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-content-tertiary font-semibold">
              {t('timer.readingTime')}
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono-num ${
                isCritical ? 'text-state-error' : 'text-content-primary'
              }`}>
                {formattedTime}
              </span>
              {isCritical && secondsLeft > 0 && !isSubmitted && (
                <span className="text-xs font-bold text-state-error animate-pulse">
                  {t('timer.timeRunningOut')}
                </span>
              )}
            </div>
          </div>
        </div>

        {!isSubmitted && (
          <Button
            variant={isPaused ? 'default' : 'secondary'}
            size="sm"
            onClick={togglePause}
            className={isPaused ? 'bg-state-warning hover:bg-state-warning-hover text-white' : ''}
            title={isPaused ? t('timer.resumeTitle') : t('timer.pauseTitle')}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current mr-1.5" /> : <Pause className="w-4 h-4 fill-current mr-1.5" />}
            <span>{isPaused ? t('timer.resume') : t('timer.pause')}</span>
          </Button>
        )}
      </div>

      <div className="mt-3">
        <Progress
          value={secondsLeft}
          max={totalSeconds}
          indicatorClassName={isCritical ? 'bg-state-error' : 'bg-action-primary'}
        />
      </div>

      {isPaused && !isSubmitted && (
        <div className="mt-3 p-3 bg-state-warning-subtle border border-state-warning-border rounded-xl text-xs text-state-warning-text font-medium">
          {t('timer.pausedNotice')}
        </div>
      )}
    </Card>
  );
}

function UntimedPracticeCard({ secondsElapsed, t }) {
  const formattedElapsed = formatTimeDisplay(secondsElapsed);

  return (
    <Card className="p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-state-info-subtle text-state-info">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-content-tertiary font-semibold">
              {t('timer.practiceMode')}
            </div>
            <div className="text-xl sm:text-2xl font-black text-content-primary font-mono-num">
              {formattedElapsed}
            </div>
          </div>
        </div>

        <Badge variant="outline" className="text-state-info-text bg-state-info-subtle border-state-info-border">
          {t('timer.untimed')}
        </Badge>
      </div>
    </Card>
  );
}

function formatTimeDisplay(totalSecs) {
  const minutes = Math.floor(Math.max(0, totalSecs) / 60);
  const seconds = Math.max(0, totalSecs) % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
