import React from 'react';
import { Check, X } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext.jsx';

function resolveExplanation(item, language) {
  return language === 'ru'
    ? item.explanation_ru || item.explanation_en
    : item.explanation_en || item.explanation_ru;
}

// Answer keys are stored lower-case with "|" between accepted spellings: show the first one,
// capitalised like a form entry (names, places, nouns).
function formatFormAnswer(value = '') {
  const [first = ''] = String(value).split('|');
  return first ? first.charAt(0).toLocaleUpperCase('de-DE') + first.slice(1) : first;
}

function AnswerCell({ item, t }) {
  const answer = item.user_answer
    ? <span lang="de" className={item.is_correct ? 'text-content-primary' : 'text-state-error-text line-through'}>{item.user_answer}</span>
    : <span className="text-content-muted">{t('results.noAnswer')}</span>;
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      {answer}
      {!item.is_correct && (
        <span lang="de" className="font-semibold text-state-success-text">→ {formatFormAnswer(item.correct_answer)}</span>
      )}
    </span>
  );
}

function FormRow({ item, t, language }) {
  const StatusIcon = item.is_correct ? Check : X;
  const explanation = item.is_correct ? '' : resolveExplanation(item, language);
  return (
    <li className="py-3 grid grid-cols-[1.25rem_1fr] gap-x-3 gap-y-1 sm:grid-cols-[1.25rem_12rem_1fr] lg:grid-cols-[1.25rem_1fr]">
      <StatusIcon
        className={`w-5 h-5 row-span-2 sm:row-span-1 lg:row-span-2 ${item.is_correct ? 'text-state-success-text' : 'text-state-error-text'}`}
        aria-label={item.is_correct ? t('results.tabCorrect') : t('results.badgeIncorrect')}
      />
      <span lang="de" className="text-sm text-content-secondary">
        {item.question_number} · {item.options_json?.form_label || item.statement}
      </span>
      <span className="text-[17px] sm:col-start-3 lg:col-start-2">
        <AnswerCell item={item} t={t} />
      </span>
      {explanation && <p className="col-start-2 sm:col-start-3 lg:col-start-2 text-sm text-content-muted">{explanation}</p>}
    </li>
  );
}

/**
 * Schreiben Teil 1 as one table: field — your answer → correct answer.
 */
export default function SchreibenFormReviewTable({ items = [] }) {
  const { t, language } = useI18n();
  const score = items.filter((item) => item.is_correct).length;

  return (
    <section aria-labelledby="form-review-title" className="rounded-2xl bg-surface-card border border-border-default p-4 sm:p-5">
      <h3 id="form-review-title" className="text-lg font-bold text-content-primary">
        {t('results.schreibenResult.formTitle', { score, max: items.length })}
      </h3>
      <ul className="divide-y divide-border-subtle">
        {items.map((item) => <FormRow key={item.id} item={item} t={t} language={language} />)}
      </ul>
    </section>
  );
}
