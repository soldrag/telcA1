import React, { useState, useEffect } from 'react';
import { Send, Copy, Check, X, Clock, ShieldCheck } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { buildAssignmentUrl } from '../../services/assignmentTokenService.js';
import { getOrCreateTeacherKey } from '../../services/security/teacherSecurityService.js';
import { formatExamName } from '../../utils/examFormat.js';

export default function CreateAssignmentModal({
  isOpen,
  examId,
  testType = 'lesen',
  onClose,
}) {
  const { t } = useI18n();
  const [timeMode, setTimeMode] = useState('standard');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [studentName, setStudentName] = useState('');
  const [note, setNote] = useState('');
  const [taskUrl, setTaskUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !examId) {
      setTaskUrl('');
      return;
    }
    const limit = timeMode === 'standard' ? 1500 : timeMode === 'none' ? 0 : customMinutes * 60;
    const teacherKey = getOrCreateTeacherKey();

    buildAssignmentUrl({
      assignmentConfig: {
        examId,
        testType,
        timeLimitSeconds: limit,
        studentName,
        note,
        teacherKey,
      },
    })
      .then((url) => setTaskUrl(url))
      .catch((err) => console.warn('[CreateAssignmentModal] URL gen error:', err));
  }, [isOpen, examId, testType, timeMode, customMinutes, studentName, note]);

  if (!isOpen || !examId) return null;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(taskUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-card border border-border-default rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-action-primary-subtle text-action-primary flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-content-primary">
                {t('modals.createAssignment.title')}
              </h3>
              <p className="text-xs text-content-secondary">
                {formatExamName(examId)} ({testType.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-content-muted hover:text-content-primary p-1.5 rounded-xl hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="block font-semibold text-content-secondary flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-action-primary" />
              <span>{t('modals.createAssignment.timeLimit')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: t('modals.createAssignment.standardTime') },
                { id: 'custom', label: t('modals.createAssignment.customTime') },
                { id: 'none', label: t('modals.createAssignment.noTimer') },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTimeMode(m.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
                    timeMode === m.id
                      ? 'bg-action-primary text-white border-action-primary'
                      : 'bg-surface-raised text-content-secondary border-border-default hover:border-border-strong'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {timeMode === 'custom' && (
              <input
                type="number"
                min="5"
                max="180"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value) || 25)}
                className="w-full mt-2 px-3 py-2 rounded-xl bg-surface-raised border border-border-default text-content-primary"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-content-secondary">
              {t('modals.createAssignment.studentName')}
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder={t('modals.createAssignment.studentNamePlaceholder')}
              maxLength={60}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-raised border border-border-default text-content-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-content-secondary">
              {t('modals.createAssignment.note')}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('modals.createAssignment.notePlaceholder')}
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-raised border border-border-default text-content-primary"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-state-success font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('modals.createAssignment.signatureProtectedNotice')}</span>
          </div>

          <div className="p-3 bg-surface-raised rounded-xl border border-border-default text-xs text-content-secondary break-all max-h-24 overflow-y-auto font-mono">
            {taskUrl || '...'}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-content-secondary hover:text-content-primary rounded-xl transition-colors min-h-[44px]"
          >
            {t('modals.createAssignment.closeBtn')}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-action-primary hover:bg-action-primary-hover text-white transition-all min-h-[44px] cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t('modals.createAssignment.linkCopied') : t('modals.createAssignment.copyLinkBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
