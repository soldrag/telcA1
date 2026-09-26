import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog.jsx';
import { LEGAL_CONFIG } from '../../config/legalConfig.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import ImpressumContent from './legal/ImpressumContent.jsx';
import DatenschutzContent from './legal/DatenschutzContent.jsx';

const TABS = ['impressum', 'datenschutz'];

function LegalTabs({ activeTab, onSelect, t }) {
  return (
    <div role="tablist" className="inline-flex gap-1 p-1 mb-4 bg-surface-inset rounded-xl border border-border-default">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onSelect(tab)}
          className={`min-h-[40px] px-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
            activeTab === tab ? 'bg-surface-card text-content-primary shadow-xs' : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          {t(`footer.${tab}`)}
        </button>
      ))}
    </div>
  );
}

export default function LegalModal({ isOpen, initialType = 'impressum', onClose }) {
  const [activeTab, setActiveTab] = useState(initialType);
  const { t } = useI18n();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t(`footer.${activeTab}`)} maxWidth="max-w-2xl">
      <LegalTabs activeTab={activeTab} onSelect={setActiveTab} t={t} />
      <div role="tabpanel" className="space-y-4">
        {activeTab === 'impressum' ? (
          <ImpressumContent operator={LEGAL_CONFIG.operator} disclaimer={LEGAL_CONFIG.disclaimer} />
        ) : (
          <DatenschutzContent operator={LEGAL_CONFIG.operator} privacy={LEGAL_CONFIG.privacy} />
        )}
      </div>
    </Dialog>
  );
}
