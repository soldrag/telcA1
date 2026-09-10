import React from 'react';
import { Timer, Pause, Play, Compass } from 'lucide-react';
import { Card } from './ui/Card.jsx';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { Progress } from './ui/Progress.jsx';

export default function ExamTimer({ timer, isSubmitted = false }) {
  if (!timer) return null;

  if (!timer.isTimed) {
    return <UntimedPracticeCard secondsElapsed={timer.secondsElapsed} />;
  }

  const { secondsLeft, totalSeconds, isPaused, togglePause } = timer;
  const formattedTime = formatTimeDisplay(secondsLeft);
  const isCritical = secondsLeft <= 5 * 60;
  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100));

  return (
    <Card className="p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${isCritical ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">
              Время на чтение (25:00)
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono-num ${
                isCritical ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {formattedTime}
              </span>
              {isCritical && secondsLeft > 0 && !isSubmitted && (
                <span className="text-xs font-bold text-rose-600 animate-pulse">
                  Осталось мало времени!
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
            className={isPaused ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
            title={isPaused ? 'Продолжить таймер' : 'Поставить на паузу'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current mr-1.5" /> : <Pause className="w-4 h-4 fill-current mr-1.5" />}
            <span>{isPaused ? 'Продолжить' : 'Пауза'}</span>
          </Button>
        )}
      </div>

      <div className="mt-3">
        <Progress
          value={secondsLeft}
          max={totalSeconds}
          indicatorClassName={isCritical ? 'bg-rose-500' : 'bg-telc-600'}
        />
      </div>

      {isPaused && !isSubmitted && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
          Экзамен на паузе. Нажмите «Продолжить», чтобы вернуть отсчёт времени.
        </div>
      )}
    </Card>
  );
}

function UntimedPracticeCard({ secondsElapsed }) {
  const formattedElapsed = formatTimeDisplay(secondsElapsed);

  return (
    <Card className="p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">
              Режим тренировки (без ограничения)
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-800 font-mono-num">
              {formattedElapsed}
            </div>
          </div>
        </div>

        <Badge variant="outline" className="text-sky-700 bg-sky-50 border-sky-200">
          Без таймера
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
