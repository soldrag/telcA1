import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import { getOrCreateTeacherKey, setTeacherKey } from '../../services/security/teacherSecurityService.js';

const SMALL_BUTTON = 'min-h-[44px] px-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary';

function KeyEditor({ initialValue, onSave, t }) {
  const [value, setValue] = useState(initialValue);
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSave(value); }} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={t('welcome.teacherSpace.keyCardTitle')}
        autoComplete="off"
        className="flex-1 min-w-0 min-h-[44px] px-3 rounded-xl bg-surface-card border border-border-default text-content-primary font-mono text-base sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
      />
      <button type="submit" className={`${SMALL_BUTTON} bg-action-primary hover:bg-action-primary-hover text-white`}>{t('welcome.teacherSpace.saveKeyBtn')}</button>
    </form>
  );
}

/**
 * Teacher key in Settings. It is created automatically; changing it only matters to use one key on two devices.
 */
export default function TeacherKeySection() {
  const { t } = useI18n();
  const [currentKey, setCurrentKey] = useState(() => getOrCreateTeacherKey());
  const [isEditing, setIsEditing] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const handleSave = (value) => {
    const updated = setTeacherKey(value);
    if (!updated) return;
    setCurrentKey(updated);
    setIsEditing(false);
  };

  return (
    <section aria-labelledby="teacher-key-title" className="space-y-2">
      <h3 id="teacher-key-title" className="text-sm font-semibold text-content-secondary">{t('welcome.teacherSpace.keyCardTitle')}</h3>
      <p className="text-sm text-content-secondary leading-relaxed">{t('welcome.teacherSpace.keyCardDesc')}</p>
      {isEditing ? <KeyEditor initialValue={currentKey} onSave={handleSave} t={t} /> : (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-inset border border-border-default p-1.5 pl-3">
          <span className="flex-1 min-w-0 font-mono text-sm font-semibold text-content-primary break-all select-all">{currentKey}</span>
          <button type="button" onClick={() => copy(currentKey)} className={`${SMALL_BUTTON} inline-flex items-center gap-1.5 text-content-primary hover:bg-surface-raised`}>
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            {copied ? t('welcome.teacherSpace.keyCopied') : t('welcome.teacherSpace.copyKeyBtn')}
          </button>
          <button type="button" onClick={() => setIsEditing(true)} className={`${SMALL_BUTTON} text-content-secondary hover:text-content-primary`}>{t('welcome.teacherSpace.changeKeyBtn')}</button>
        </div>
      )}
    </section>
  );
}
