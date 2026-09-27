/**
 * Stage 4: Feedback Summary.
 * Assembles feedback from computed facts using verified A1 German phrases.
 */

export function assembleDeterministicFeedback({
  anredeScore = 0,
  lpScore = 0,
  grussScore = 0,
  grammarErrorCount = 0
}) {
  const hasGoodFraming = anredeScore === 2 && grussScore === 2;

  const gramText = grammarErrorCount === 0
    ? 'Sprachlich sehr sorgfältig: keine wesentlichen Grammatikfehler gefunden.'
    : (grammarErrorCount <= 2
      ? 'Gute sprachliche Verständlichkeit mit nur wenigen kleinen Fehlern.'
      : (grammarErrorCount <= 5
        ? 'Achten Sie auf Verbformen und Wortstellung, um Punktabzüge zu vermeiden.'
        : 'Mehrere Grammatik- und Satzbaufehler beeinträchtigen die Verständlichkeit.'));

  if (lpScore === 0) {
    if (hasGoodFraming) {
      return `Die Anrede ist passend und formal korrekt gewählt, und die Grußformel ist vollständig. Allerdings wurde das geforderte Thema verfehlt: Die Inhaltspunkte wurden nicht erfüllt oder inhaltlich abgelehnt. ${gramText}`;
    }
    const framingProblem = anredeScore === 0 && grussScore === 0
      ? 'Es fehlen sowohl eine passende Anrede als auch die Grußformel.'
      : (anredeScore === 0 ? 'Es fehlt eine passende Anrede zu Beginn.' : 'Die Grußformel oder der Name am Schluss ist unvollständig.');
    return `Die geforderten Inhaltspunkte wurden nicht erfüllt oder inhaltlich abgelehnt. ${framingProblem} ${gramText}`;
  }

  if (lpScore >= 5) {
    if (hasGoodFraming) {
      return `Die Anrede ist passend und formal korrekt gewählt. Alle drei Inhaltspunkte sind verständlich und vollständig bearbeitet. Grußformel und Name am Schluss sind vollständig und passend. ${gramText}`;
    }
    const framingNote = anredeScore < 2
      ? 'Die Inhaltspunkte sind vollständig bearbeitet, achten Sie jedoch auf eine korrekte formelle Anrede.'
      : 'Die Inhaltspunkte sind vollständig bearbeitet, achten Sie jedoch auf eine vollständige Grußformel mit Namen.';
    return `${framingNote} ${gramText}`;
  }

  if (hasGoodFraming) {
    return `Die Anrede ist passend und formal korrekt gewählt. Die Inhaltspunkte wurden im Wesentlichen bearbeitet, teilweise fehlen jedoch wichtige Einzelheiten. Grußformel und Name am Schluss sind passend. ${gramText}`;
  }
  return `Die geforderten Inhaltspunkte wurden nur teilweise bearbeitet. Achten Sie zudem auf die formale Gestaltung von Anrede und Grußformel. ${gramText}`;
}
