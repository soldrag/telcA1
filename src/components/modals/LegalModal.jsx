import React, { useState } from 'react';
import { Shield, FileText, X } from 'lucide-react';
import { LEGAL_CONFIG } from '../../config/legalConfig.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import ImpressumContent from './legal/ImpressumContent.jsx';
import DatenschutzContent from './legal/DatenschutzContent.jsx';

export default function LegalModal({ isOpen, initialType = 'impressum', onClose }) {
  const [activeTab, setActiveTab] = useState(initialType);
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-card border border-border-default rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-scaleUp">
        <div className="p-5 border-b border-border-default flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-2xl bg-action-primary-subtle text-action-primary flex items-center justify-center">
              {activeTab === 'impressum' ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div className="flex space-x-1 bg-surface-raised p-1 rounded-xl border border-border-default">
              <button
                type="button"
                onClick={() => setActiveTab('impressum')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'impressum'
                    ? 'bg-action-primary text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {t('footer.impressum') || 'Impressum'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('datenschutz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'datenschutz'
                    ? 'bg-action-primary text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {t('footer.datenschutz') || 'Datenschutz'}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-content-muted hover:text-content-primary p-2 rounded-xl hover:bg-surface-raised transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'impressum' ? (
            <ImpressumContent operator={LEGAL_CONFIG.operator} disclaimer={LEGAL_CONFIG.disclaimer} />
          ) : (
            <DatenschutzContent operator={LEGAL_CONFIG.operator} privacy={LEGAL_CONFIG.privacy} />
          )}
        </div>

        <div className="p-4 border-t border-border-default flex justify-end bg-surface-raised/40 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-action-primary hover:bg-action-primary-hover rounded-xl transition-all"
          >
            {t('modals.shareClose') || 'Schließen'}
          </button>
        </div>
      </div>
    </div>
  );
}
