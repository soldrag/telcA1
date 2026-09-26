import React, { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { formatExamName } from '../../../utils/examFormat.js';

const FIELD = 'w-full min-h-[3rem] px-4 rounded-xl bg-surface-card border border-border-default text-content-primary text-base sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';
const LABEL = 'block text-sm font-semibold text-content-secondary mb-1.5';

function segmentClass(isActive) {
  const base = 'min-h-[2.75rem] px-3 rounded-xl border text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';
  return `${base} ${isActive ? 'bg-action-primary text-white border-action-primary' : 'bg-surface-card text-content-primary border-border-default hover:bg-surface-raised'}`;
}

function TimeField({ form, update, standardMinutes, t }) {
  const modes = [
    { id: 'standard', label: t('modals.createAssignment.standardTime', { minutes: standardMinutes }) },
    { id: 'custom', label: t('modals.createAssignment.customTime') },
    { id: 'none', label: t('modals.createAssignment.noTimer') },
  ];
  return (
    <fieldset>
      <legend className={LABEL}>{t('modals.createAssignment.timeLimit')}</legend>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode) => (
          <button key={mode.id} type="button" aria-pressed={form.timeMode === mode.id} onClick={() => update({ timeMode: mode.id })} className={segmentClass(form.timeMode === mode.id)}>
            {mode.label}
          </button>
        ))}
      </div>
      {form.timeMode === 'custom' && (
        <input type="number" min="5" max="180" aria-label={t('modals.createAssignment.customTime')} value={form.customMinutes}
          onChange={(event) => update({ customMinutes: Number(event.target.value) || standardMinutes })} className={`${FIELD} mt-2`} />
      )}
    </fieldset>
  );
}

function TextField({ id, label, value, onChange, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} className={FIELD} {...inputProps} />
    </div>
  );
}

function VariantField({ exams, value, onChange, t }) {
  return (
    <div>
      <label htmlFor="assignment-variant" className={LABEL}>{t('modals.createAssignment.variant')}</label>
      <select id="assignment-variant" value={value} onChange={(event) => onChange(event.target.value)} className={`${FIELD} cursor-pointer`}>
        {exams.map((exam) => <option key={exam.id} value={exam.id}>{formatExamName(exam.id)}</option>)}
      </select>
    </div>
  );
}

/**
 * Assignment settings: variant, time, student, deadline and a note. Submitting creates the signed link.
 */
export default function AssignmentForm({ initialExamId, exams = [], standardMinutes, isBusy, onSubmit }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ examId: initialExamId || exams[0]?.id || '', timeMode: 'standard', customMinutes: standardMinutes, studentName: '', deadline: '', note: '' });
  const update = (patch) => setForm((current) => ({ ...current, ...patch }));
  const field = (key) => ({ value: form[key], onChange: (value) => update({ [key]: value }) });
  const handleSubmit = (event) => { event.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {exams.length > 1 && <VariantField exams={exams} t={t} {...field('examId')} />}
      <TimeField form={form} update={update} standardMinutes={standardMinutes} t={t} />
      <TextField id="assignment-student" label={t('modals.createAssignment.studentName')} placeholder={t('modals.createAssignment.studentNamePlaceholder')} maxLength={60} autoComplete="off" {...field('studentName')} />
      <div className="grid grid-cols-1 sm:grid-cols-[11.25rem_minmax(0,1fr)] gap-4">
        <TextField id="assignment-deadline" type="date" label={t('modals.createAssignment.deadline')} {...field('deadline')} />
        <TextField id="assignment-note" label={t('modals.createAssignment.note')} placeholder={t('modals.createAssignment.notePlaceholder')} maxLength={120} {...field('note')} />
      </div>
      <button type="submit" disabled={isBusy || !form.examId} className="w-full min-h-[3.25rem] rounded-xl bg-action-primary hover:bg-action-primary-hover disabled:opacity-60 text-white font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2">
        {t('modals.createAssignment.createBtn')}
      </button>
    </form>
  );
}
