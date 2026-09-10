import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';

export default function ExamHeaderActions({ onNavigateHome, onSubmitExam, answeredCount, totalQuestions }) {
  const isAllAnswered = answeredCount === totalQuestions;

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={onNavigateHome}
        title="Вернуться к выбору вариантов"
        className="text-xs sm:text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>В меню</span>
      </Button>

      <Badge variant="secondary" className="px-3 py-1.5 hidden md:inline-flex text-xs font-bold text-slate-700">
        Отвечено: {answeredCount} / {totalQuestions}
      </Badge>

      <Button
        variant={isAllAnswered ? 'success' : 'default'}
        size="sm"
        onClick={onSubmitExam}
        className="text-xs sm:text-sm shadow-sm"
      >
        <CheckCircle2 className="w-4 h-4 mr-1.5" />
        <span>Завершить ({answeredCount}/{totalQuestions})</span>
      </Button>
    </>
  );
}
