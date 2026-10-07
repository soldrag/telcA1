import React from 'react';
import { Info } from 'lucide-react';

/**
 * Under the Teil 2 points: the program confirms each Leitpunkt is present, while an examiner may still give 1.5
 * for a point that is present but unclear or off-target (examiner-scored samples show this gap).
 */
export default function SchreibenScoringScopeNote({ t }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-content-muted leading-snug">
      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{t('results.schreibenResult.scoringScope')}</span>
    </p>
  );
}
