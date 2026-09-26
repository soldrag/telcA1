import React from 'react';
import { Flag } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const ANSWER_MARKS = { richtig: '+', falsch: '−' };

function formatAnswerMark(answer) {
  if (!answer) return '';
  const normalized = String(answer).toLowerCase();
  if (ANSWER_MARKS[normalized]) return ANSWER_MARKS[normalized];
  return normalized.length <= 2 ? normalized : '✓';
}

function resolveCellClass({ isAnswered, isCurrent, isFlagged }) {
  const fill = isAnswered
    ? 'bg-action-primary-subtle border-action-primary text-content-primary'
    : 'bg-surface-card border-border-default text-content-secondary hover:border-border-strong';
  const flag = isFlagged ? ' border-state-warning bg-state-warning-subtle' : '';
  const current = isCurrent ? ' ring-2 ring-action-primary ring-offset-1 ring-offset-surface-card' : '';
  return fill + flag + current;
}

function AnswerCell({ question, answer, isCurrent, isFlagged, onSelect, isCompact, t }) {
  const mark = formatAnswerMark(answer);
  const label = mark
    ? t('exam.questionTooltipAnswered', { number: question.question_number, answer: mark })
    : t('exam.questionTooltipUnanswered', { number: question.question_number });

  return (
    <button
      type="button"
      onClick={() => onSelect(question)}
      aria-label={isFlagged ? `${label} · ${t('exam.flagged')}` : label}
      aria-current={isCurrent ? 'step' : undefined}
      className={`relative ${isCompact ? 'w-9 h-9' : 'w-11 h-11'} shrink-0 rounded-lg border flex flex-col items-center justify-center leading-none transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${resolveCellClass({ isAnswered: Boolean(mark), isCurrent, isFlagged })}`}
    >
      <span className="text-xs font-semibold tabular-nums">{question.question_number}</span>
      <span className={`font-semibold ${isCompact ? 'text-xs h-3.5' : 'text-sm h-4'}`}>{mark}</span>
      {isFlagged && <Flag className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-state-warning fill-current" aria-hidden="true" />}
    </button>
  );
}

export default function AnswerSheetGrid({ groups, answers, flags, currentQuestionId, onSelect, layout = 'grid' }) {
  const { t } = useI18n();
  const isStrip = layout === 'strip';

  return (
    <div className={isStrip ? 'flex items-center gap-2 overflow-x-auto py-1' : 'space-y-4'}>
      {groups.map((group, index) => (
        <div key={group.teil} className={isStrip ? `flex items-center gap-1 ${index > 0 ? 'pl-2 border-l border-border-default' : ''}` : 'space-y-2'}>
          {!isStrip && <div className="text-sm font-semibold text-content-secondary">{group.label} · {group.sublabel}</div>}
          <div className={isStrip ? 'flex gap-1' : 'flex flex-wrap gap-2'}>
            {group.questions.map((question) => (
              <AnswerCell
                key={question.id}
                question={question}
                answer={answers[question.id]}
                isCurrent={question.id === currentQuestionId}
                isFlagged={Boolean(flags[question.id])}
                onSelect={onSelect}
                isCompact={isStrip}
                t={t}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
