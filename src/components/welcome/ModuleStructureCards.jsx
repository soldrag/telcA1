import React from 'react';
import { Mail, Globe, FileText, Headphones, Radio, PhoneCall, PenTool, MessageSquare, Users } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const MODULE_STRUCTURES = {
  lesen: [
    { icon: Mail, label: 'Teil 1 (1–5)', titleKey: 'welcome.structure.lesenTeil1Title', subKey: 'welcome.structure.lesenTeil1Sub' },
    { icon: Globe, label: 'Teil 2 (6–10)', titleKey: 'welcome.structure.lesenTeil2Title', subKey: 'welcome.structure.lesenTeil2Sub' },
    { icon: FileText, label: 'Teil 3 (11–15)', titleKey: 'welcome.structure.lesenTeil3Title', subKey: 'welcome.structure.lesenTeil3Sub' },
  ],
  hoeren: [
    { icon: Headphones, label: 'Teil 1 (1–6)', titleKey: 'welcome.structure.hoerenTeil1Title', subKey: 'welcome.structure.hoerenTeil1Sub' },
    { icon: Radio, label: 'Teil 2 (7–10)', titleKey: 'welcome.structure.hoerenTeil2Title', subKey: 'welcome.structure.hoerenTeil2Sub' },
    { icon: PhoneCall, label: 'Teil 3 (11–15)', titleKey: 'welcome.structure.hoerenTeil3Title', subKey: 'welcome.structure.hoerenTeil3Sub' },
  ],
  schreiben: [
    { icon: PenTool, label: 'Teil 1 (1–5)', titleKey: 'welcome.structure.schreibenTeil1Title', subKey: 'welcome.structure.schreibenTeil1Sub' },
    { icon: Mail, label: 'Teil 2 (6)', titleKey: 'welcome.structure.schreibenTeil2Title', subKey: 'welcome.structure.schreibenTeil2Sub' },
  ],
  sprechen: [
    { icon: Users, label: 'Teil 1', titleKey: 'welcome.structure.sprechenTeil1Title', subKey: 'welcome.structure.sprechenTeil1Sub' },
    { icon: MessageSquare, label: 'Teil 2', titleKey: 'welcome.structure.sprechenTeil2Title', subKey: 'welcome.structure.sprechenTeil2Sub' },
    { icon: MessageSquare, label: 'Teil 3', titleKey: 'welcome.structure.sprechenTeil3Title', subKey: 'welcome.structure.sprechenTeil3Sub' },
  ],
};

export default function ModuleStructureCards({ testType = 'lesen' }) {
  const { t } = useI18n();
  const cards = MODULE_STRUCTURES[testType] || MODULE_STRUCTURES.lesen;
  const gridColsClass = cards.length === 2 ? 'sm:grid-cols-2' : (cards.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3');

  return (
    <div className={`grid grid-cols-1 ${gridColsClass} gap-3 mt-7 pt-5 border-t border-white/10 relative z-10`}>
      {cards.map((card, cardIndex) => {
        const Icon = card.icon;
        return (
          <div key={cardIndex} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="flex items-center space-x-2 text-sky-200 text-xs font-bold uppercase">
              <Icon className="w-4 h-4" />
              <span>{card.label}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              {t(card.titleKey)}
            </div>
            <div className="text-xs text-white/80 mt-0.5">
              {t(card.subKey)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
