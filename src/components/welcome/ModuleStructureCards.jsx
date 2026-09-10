import React from 'react';
import { Mail, Globe, FileText, Headphones, Radio, PhoneCall, PenTool, MessageSquare, Users } from 'lucide-react';

const MODULE_STRUCTURES = {
  lesen: [
    { icon: Mail, label: 'Teil 1 (1–5)', title: '2 письма / e-mail', sub: 'Richtig / Falsch' },
    { icon: Globe, label: 'Teil 2 (6–10)', title: '5 ситуаций и сайтов', sub: 'Выбор: a или b' },
    { icon: FileText, label: 'Teil 3 (11–15)', title: '5 вывесок и объявлений', sub: 'Richtig / Falsch' },
  ],
  hoeren: [
    { icon: Headphones, label: 'Teil 1 (1–6)', title: 'Короткие диалоги', sub: 'Выбор: a, b или c' },
    { icon: Radio, label: 'Teil 2 (7–10)', title: 'Объявления на вокзале', sub: 'Richtig / Falsch' },
    { icon: PhoneCall, label: 'Teil 3 (11–15)', title: 'Сообщения на автоответчике', sub: 'Richtig / Falsch' },
  ],
  schreiben: [
    { icon: PenTool, label: 'Teil 1 (1–5)', title: 'Заполнение формуляра', sub: '5 пунктов (5 баллов)' },
    { icon: Mail, label: 'Teil 2 (6)', title: 'Написание короткого письма', sub: 'ca. 30 слов (10 баллов)' },
  ],
  sprechen: [
    { icon: Users, label: 'Teil 1', title: 'Sich vorstellen', sub: 'Рассказ о себе + вопросы' },
    { icon: MessageSquare, label: 'Teil 2', title: 'Informationen erfragen', sub: 'Вопросы по карточкам' },
    { icon: MessageSquare, label: 'Teil 3', title: 'Bitten formulieren', sub: 'Просьбы и реакции' },
  ],
};

export default function ModuleStructureCards({ testType = 'lesen' }) {
  const cards = MODULE_STRUCTURES[testType] || MODULE_STRUCTURES.lesen;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7 pt-5 border-t border-white/10 relative z-10">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="flex items-center space-x-2 text-sky-200 text-xs font-bold uppercase">
              <Icon className="w-4 h-4" />
              <span>{card.label}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">{card.title}</div>
            <div className="text-xs text-slate-300 mt-0.5">{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
