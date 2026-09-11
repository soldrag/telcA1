import React from 'react';
import { Mail, Globe, FileText, Headphones, Radio, PhoneCall, PenTool, MessageSquare, Users } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const MODULE_STRUCTURES = {
  lesen: [
    { icon: Mail, label: 'Teil 1 (1–5)', title: '2 письма / e-mail', titleEn: '2 letters / e-mails', sub: 'Richtig / Falsch', subEn: 'True / False' },
    { icon: Globe, label: 'Teil 2 (6–10)', title: '5 ситуаций и сайтов', titleEn: '5 situations & websites', sub: 'Выбор: a или b', subEn: 'Choice: a or b' },
    { icon: FileText, label: 'Teil 3 (11–15)', title: '5 вывесок и объявлений', titleEn: '5 signs & notices', sub: 'Richtig / Falsch', subEn: 'True / False' },
  ],
  hoeren: [
    { icon: Headphones, label: 'Teil 1 (1–6)', title: 'Короткие диалоги', titleEn: 'Short dialogs', sub: 'Выбор: a, b или c', subEn: 'Choice: a, b or c' },
    { icon: Radio, label: 'Teil 2 (7–10)', title: 'Объявления на вокзале', titleEn: 'Station announcements', sub: 'Richtig / Falsch', subEn: 'True / False' },
    { icon: PhoneCall, label: 'Teil 3 (11–15)', title: 'Сообщения на автоответчике', titleEn: 'Voicemail messages', sub: 'Richtig / Falsch', subEn: 'True / False' },
  ],
  schreiben: [
    { icon: PenTool, label: 'Teil 1 (1–5)', title: 'Заполнение формуляра', titleEn: 'Fill out a form', sub: '5 пунктов (5 баллов)', subEn: '5 fields (5 points)' },
    { icon: Mail, label: 'Teil 2 (6)', title: 'Написание короткого письма', titleEn: 'Write a short message', sub: 'ca. 30 слов (10 баллов)', subEn: 'ca. 30 words (10 points)' },
  ],
  sprechen: [
    { icon: Users, label: 'Teil 1', title: 'Sich vorstellen', titleEn: 'Self introduction', sub: 'Рассказ о себе + вопросы', subEn: 'Intro + questions' },
    { icon: MessageSquare, label: 'Teil 2', title: 'Informationen erfragen', titleEn: 'Ask for information', sub: 'Вопросы по карточкам', subEn: 'Questions from cards' },
    { icon: MessageSquare, label: 'Teil 3', title: 'Bitten formulieren', titleEn: 'Formulate requests', sub: 'Просьбы и реакции', subEn: 'Requests & responses' },
  ],
};

export default function ModuleStructureCards({ testType = 'lesen' }) {
  const { isRussian } = useI18n();
  const cards = MODULE_STRUCTURES[testType] || MODULE_STRUCTURES.lesen;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7 pt-5 border-t border-white/10 relative z-10">
      {cards.map((card, cardIndex) => {
        const Icon = card.icon;
        return (
          <div key={cardIndex} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="flex items-center space-x-2 text-sky-200 text-xs font-bold uppercase">
              <Icon className="w-4 h-4" />
              <span>{card.label}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              {isRussian ? card.title : card.titleEn}
            </div>
            <div className="text-xs text-white/80 mt-0.5">
              {isRussian ? card.sub : card.subEn}
            </div>
          </div>
        );
      })}
    </div>
  );
}
