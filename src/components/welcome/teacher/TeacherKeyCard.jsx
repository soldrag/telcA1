import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, KeyRound } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import {
  getOrCreateTeacherKey,
  setTeacherKey,
} from '../../../services/security/teacherSecurityService.js';

export default function TeacherKeyCard() {
  const { t } = useI18n();
  const [currentKey, setCurrentKey] = useState(() => getOrCreateTeacherKey());
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(currentKey);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentKey);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSave = () => {
    const updated = setTeacherKey(inputVal);
    if (updated) {
      setCurrentKey(updated);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-surface-card border border-border-default rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-action-primary-subtle text-action-primary flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-content-primary">
              {t('welcome.teacherSpace.keyCardTitle')}
            </h3>
            <p className="text-xs text-content-secondary">
              {t('welcome.teacherSpace.keyCardDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-state-success-subtle text-state-success text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>HMAC-SHA256</span>
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="LEHRER-XXXX-1234"
            className="flex-1 px-4 py-2 rounded-xl bg-surface-raised border border-border-default text-content-primary font-mono text-xs sm:text-sm"
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-action-primary text-white font-bold text-xs min-h-[40px] cursor-pointer"
          >
            {t('welcome.teacherSpace.saveKeyBtn')}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-raised rounded-2xl border border-border-default">
          <span className="font-mono text-sm font-bold text-content-primary tracking-wider select-all">
            {currentKey}
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-card border border-border-default hover:border-action-primary text-content-primary transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-state-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('welcome.teacherSpace.keyCopied') : t('welcome.teacherSpace.copyKeyBtn')}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors cursor-pointer"
            >
              {t('welcome.teacherSpace.changeKeyBtn')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
