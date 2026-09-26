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

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {cards.map(({ icon: Icon, label, titleKey, subKey }) => (
        <li key={label} className="rounded-xl bg-surface-inset p-3">
          <div className="flex items-center gap-2 text-content-secondary text-sm font-medium">
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </div>
          <div className="text-sm font-semibold text-content-primary mt-1">{t(titleKey)}</div>
          <div className="text-sm text-content-secondary">{t(subKey)}</div>
        </li>
      ))}
    </ul>
  );
}
