/**
 * telc A1 concept domains: word clusters of the A1 vocabulary (persons, occupation, time, price, pets,
 * acceptance of an invitation, registration, reasons, places) that let a rubric aspect label be recognised in a student sentence.
 * Written as plain words; the engine stems them with the level lexicon exactly like the text (conceptDomainScorer.js).
 * Level data injected through A1RankerPolicy.conceptDomains.
 */
export const A1_CONCEPT_DOMAINS = Object.freeze({
  person: ['person', 'leute', 'mann', 'frau', 'kind', 'familie', 'freund', 'kollege', 'erwachsene', 'gast', 'begleitung',
    'zwei', 'drei', 'vier', 'fünf', 'fuenf', 'allein', 'alleine', 'paar'],
  zeit: ['zeit', 'zeitraum', 'dauer', 'datum', 'termin', 'anreise', 'abreise', 'ankunft', 'abfahrt', 'wann', 'woche', 'monat',
    'vormittag', 'nachmittag', 'abend', 'tag', 'januar', 'februar', 'märz', 'maerz', 'april', 'mai', 'juni', 'juli', 'august',
    'september', 'oktober', 'november', 'dezember', 'sommer', 'winter', 'herbst', 'frühling', 'fruehling',
    'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag', 'wochenende'],
  // No bare "viel": it is "Vielen Dank"/"viele Fragen"; "Wie viel kostet …" is proven by "kosten".
  preis: ['preis', 'kosten', 'euro', 'bezahlen', 'zahlen', 'teuer', 'billig', 'günstig', 'guenstig', 'gebühr', 'gebuehr',
    'miete', 'kaution'],
  tier: ['tier', 'haustier', 'hund', 'katze', 'vogel', 'mitbringen', 'mitkommen'],
  beruf: ['beruf', 'arbeit', 'job', 'firma', 'büro', 'student', 'studentin', 'ingenieur', 'ingenieurin', 'arzt', 'ärztin',
    'lehrer', 'lehrerin', 'verkäufer', 'verkäuferin', 'koch', 'köchin', 'kellner', 'kellnerin', 'friseur', 'friseurin',
    'mechaniker', 'programmierer'],
  // Acceptance needs its own word: a bare "kommen" is also origin ("komme aus") or a companion ("kommt mit").
  zusage: ['zusage', 'zusagen', 'gern', 'gerne', 'dabei', 'teilnehmen'],
  anmeld: ['anmeldung', 'anmelden', 'melden', 'registrieren', 'einschreiben'],
  grund: ['grund', 'warum', 'weil', 'denn', 'möchten', 'wollen', 'interesse', 'urlaub', 'reise', 'besuch', 'einladung',
    'feier', 'feiern', 'krank', 'absagen', 'buchen'],
  ort: ['ort', 'wo', 'adresse', 'stadt', 'straße', 'wohnen', 'wohnung', 'hotel', 'bahnhof', 'flughafen', 'zimmer', 'haus'],
});
