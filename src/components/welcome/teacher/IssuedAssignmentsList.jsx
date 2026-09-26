import React from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { useIssuedAssignments } from '../../../hooks/useIssuedAssignments.js';
import { formatDayMonth } from '../../../utils/historyFormat.js';
import { describeIssuedAssignment, STATUS_TONE_CLASS } from './issuedStatus.js';

const ACTION = 'min-h-[44px] px-3 rounded-xl text-sm font-semibold text-action-primary hover:bg-action-primary-subtle cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';

function RowAction({ row, entry, onOpenLink, onOpenReview, t }) {
  if (row.latestReviewToken) {
    return <button type="button" onClick={() => onOpenReview?.(row.latestReviewToken)} className={ACTION}>{t('welcome.teacherSpace.reviewBtn')}</button>;
  }
  return <button type="button" onClick={() => onOpenLink?.(entry)} className={ACTION}>{t('welcome.teacherSpace.linkBtn')}</button>;
}

function Deadline({ entry, language, t }) {
  if (!entry.deadline) return null;
  return <span className="block text-sm text-content-muted">{t('welcome.assignments.due', { date: formatDayMonth(entry.deadline, language) })}</span>;
}

// From 1024 px the full table; 640–1023 drops the «Issued» date.
function IssuedTable({ rows, t, language, ...handlers }) {
  const head = 'px-4 py-3 text-left text-sm font-medium text-content-muted';
  return (
    <table className="max-sm:hidden w-full rounded-2xl bg-surface-card border border-border-default overflow-hidden">
      <thead className="border-b border-border-default">
        <tr>
          <th scope="col" className={head}>{t('welcome.teacherSpace.colStudent')}</th>
          <th scope="col" className={head}>{t('welcome.teacherSpace.colVariant')}</th>
          <th scope="col" className={`${head} max-lg:hidden`}>{t('welcome.teacherSpace.colIssued')}</th>
          <th scope="col" className={head}>{t('welcome.teacherSpace.colStatus')}</th>
          <th scope="col"><span className="sr-only">{t('welcome.teacherSpace.colAction')}</span></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-default">
        {rows.map(({ entry, row }) => (
          <tr key={entry.assignmentId}>
            <td className="px-4 py-3 font-semibold text-content-primary break-words">{row.student}</td>
            <td className="px-4 py-3 text-content-primary"><span lang="de">{row.variant}</span><Deadline entry={entry} language={language} t={t} /></td>
            <td className="px-4 py-3 text-content-secondary whitespace-nowrap max-lg:hidden">{formatDayMonth(entry.issuedAt, language)}</td>
            <td className={`px-4 py-3 tabular-nums ${STATUS_TONE_CLASS[row.status.tone]}`}>{row.status.text}</td>
            <td className="px-2 py-1 text-right"><RowAction row={row} entry={entry} t={t} {...handlers} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IssuedCards({ rows, t, language, ...handlers }) {
  return (
    <ul className="sm:hidden space-y-2">
      {rows.map(({ entry, row }) => (
        <li key={entry.assignmentId} className="rounded-2xl bg-surface-card border border-border-default p-4 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="font-semibold text-content-primary break-words">{row.student}</div>
            <div lang="de" className="text-sm text-content-secondary">{row.variant}</div>
            <div className={`text-sm tabular-nums ${STATUS_TONE_CLASS[row.status.tone]}`}>{row.status.text}</div>
            <Deadline entry={entry} language={language} t={t} />
          </div>
          <div className="shrink-0"><RowAction row={row} entry={entry} t={t} {...handlers} /></div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Assignments issued from this browser (localStorage `telc_issued`) with the results that came back.
 */
export default function IssuedAssignmentsList({ onOpenLink, onOpenReview }) {
  const { t, language } = useI18n();
  const issued = useIssuedAssignments();
  if (issued.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border-default p-5 text-content-secondary">{t('welcome.teacherSpace.issuedEmpty')}</p>;
  }
  const rows = issued.map((entry) => ({ entry, row: describeIssuedAssignment(entry, t, language) }));
  const shared = { rows, t, language, onOpenLink, onOpenReview };
  return (
    <>
      <IssuedTable {...shared} />
      <IssuedCards {...shared} />
    </>
  );
}
