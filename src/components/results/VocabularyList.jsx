import React from 'react';
import { BookOpen } from 'lucide-react';

function resolveWordTranslation(entry, language, liveNotes) {
  if (!entry) return '';
  const liveEntry = liveNotes?.find((note) => note.word === entry.word);
  const en = entry.translation_en || liveEntry?.translation_en;
  const ru = entry.translation_ru || entry.translation || liveEntry?.translation_ru || liveEntry?.translation;
  return language === 'ru' ? (ru || en || '') : (en || ru || '');
}

/**
 * Useful A1 words of a task, with the translation in the UI language.
 */
export default function VocabularyList({ entries = [], liveNotes, language, title }) {
  if (!entries?.length) return null;
  return (
    <div className="bg-surface-inset rounded-xl p-3 border border-border-default">
      <div className="flex items-center gap-2 text-sm font-semibold text-content-secondary mb-2">
        <BookOpen className="w-4 h-4 text-action-primary" aria-hidden="true" />
        <span>{title}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {entries.map((entry, index) => (
          <div key={index} className="bg-surface-card px-3 py-1.5 rounded-lg border border-border-subtle text-sm">
            <span lang="de" className="font-semibold text-content-primary">{entry.word}</span>
            <span className="text-content-muted mx-1">—</span>
            <span className="text-content-secondary">{resolveWordTranslation(entry, language, liveNotes)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
