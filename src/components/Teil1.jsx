import React, { useState } from 'react';
import { Mail, HelpCircle } from 'lucide-react';
import Teil1TextCard from './teil1/Teil1TextCard.jsx';
import Teil1QuestionItem from './teil1/Teil1QuestionItem.jsx';

function Teil1Banner() {
  return (
    <div className="bg-white border-l-4 border-telc-600 rounded-r-2xl p-5 shadow-sm border-y border-r border-slate-200">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-telc-50 text-telc-700 rounded-xl mt-0.5 border border-telc-200 shadow-xs">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-telc-700 bg-telc-50 px-3 py-1 rounded border border-telc-200">
              Leseverstehen • Teil 1
            </span>
            <span className="text-xs text-slate-600 font-bold">Aufgaben 1–5</span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-slate-950 mt-1">
            E-Mails, Briefe und persönliche Mitteilungen
          </h2>
          <p className="text-sm text-slate-700 mt-1 font-medium leading-normal">
            Lesen Sie die Texte und die Aufgaben 1 bis 5. Ist die Aussage{' '}
            <strong className="text-emerald-700 font-black">richtig (+)</strong> oder{' '}
            <strong className="text-rose-700 font-black">falsch (-)</strong>?
          </p>
        </div>
      </div>
    </div>
  );
}

function groupQuestionsByText(questions) {
  return questions.reduce((groups, question) => {
    const groupKey = question.title || 'Text';
    if (!groups[groupKey]) {
      groups[groupKey] = {
        title: question.title,
        header: question.context_header,
        body: question.context_body,
        items: [],
      };
    }
    groups[groupKey].items.push(question);
    return groups;
  }, {});
}

export default function Teil1({
  questions = [],
  answers = {},
  onSelectAnswer,
  isSubmitted,
}) {
  const [fontSizeLevel, setFontSizeLevel] = useState('normal');
  const groupedByText = groupQuestionsByText(questions);

  return (
    <div className="space-y-8">
      <Teil1Banner />

      {Object.values(groupedByText).map((group, groupIndex) => {
        const answeredCount = group.items.filter((item) => Boolean(answers[item.id])).length;
        const totalCount = group.items.length;
        const questionNumbers = group.items.map((item) => item.question_number).join(', ');

        return (
          <div
            key={groupIndex}
            className="bg-white rounded-3xl border-2 border-slate-300 overflow-hidden shadow-md"
          >
            <div className="bg-slate-100/90 border-b-2 border-slate-200 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-black uppercase tracking-wider text-white bg-telc-800 px-3 py-1 rounded-lg shadow-xs">
                  Text {groupIndex + 1}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-950">
                  {group.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-300 shadow-xs">
                  К заданиям: <strong className="text-slate-950 font-black">{questionNumbers}</strong>
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${
                  answeredCount === totalCount
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-200/80 text-slate-800 border-slate-300'
                }`}>
                  {answeredCount}/{totalCount} готово
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x-2 lg:divide-slate-200 items-start">
              <Teil1TextCard
                headerText={group.header}
                bodyText={group.body}
                fontSizeLevel={fontSizeLevel}
                onSelectFontSizeLevel={setFontSizeLevel}
              />

              <div className="lg:col-span-5 p-5 sm:p-6 bg-white flex flex-col justify-between space-y-5">
                <div className="space-y-5">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b-2 border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-950">
                      Задания к тексту {groupIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-telc-800 bg-telc-50 px-3 py-1 rounded border border-telc-200">
                      Выберите + или -
                    </span>
                  </div>

                  {group.items.map((question) => (
                    <Teil1QuestionItem
                      key={question.id}
                      question={question}
                      currentAnswer={answers[question.id]}
                      isSubmitted={isSubmitted}
                      onSelectAnswer={onSelectAnswer}
                    />
                  ))}
                </div>

                <div className="bg-blue-50/80 border border-blue-200 text-blue-950 text-xs sm:text-sm font-medium rounded-xl p-3 flex items-center justify-center space-x-2 shadow-xs">
                  <HelpCircle className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  <span>Перечитайте текст слева при сомнениях перед выбором ответа</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
