/**
 * telc A1 concept domains: stem clusters of the A1 vocabulary (persons, occupation, time, price, pets,
 * acceptance of an invitation, registration, reasons, places) that let a rubric aspect label be recognised in a student sentence.
 * Level data injected through A1RankerPolicy.conceptDomains; the matching is conceptDomainScorer.js.
 */
export const A1_CONCEPT_DOMAINS = Object.freeze({
  person: ['person', 'leut', 'mann', 'frau', 'kind', 'famili', 'freund', 'kolleg', 'erwachsen', 'gast', 'begleit', 'drei', 'zwei', 'vier', 'fuenf', 'fünf', 'allein', 'alleine', 'paar'],
  zeit: ['zeit', 'zeitraum', 'dauer', 'datum', 'termin', 'anreis', 'abreis', 'ankunft', 'abfahrt', 'wann', 'woche', 'monat', 'vormittag', 'nachmittag', 'abend', 'tag', 'januar', 'februar', 'märz', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember', 'sommer', 'winter', 'herbst', 'frühling', 'fruehling', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag', 'wochenende'],
  preis: ['preis', 'kost', 'kosten', 'euro', 'bezahl', 'zahl', 'teu', 'billig', 'guenst', 'günst', 'gebühr', 'gebuehr', 'miet', 'kaut', 'viel'],
  tier: ['tier', 'hausti', 'ti', 'hund', 'katz', 'vogel', 'mitbring', 'mitkomm'],
  beruf: ['beruf', 'arbeit', 'job', 'firma', 'büro', 'studen', 'studentin', 'ingenieur', 'ingenieurin', 'arz', 'ärztin', 'lehr',
    'lehrerin', 'verkäuf', 'verkäuferin', 'koch', 'köchin', 'kelln', 'kellnerin', 'friseur', 'friseurin', 'mechanik', 'programmier'],
  // Acceptance needs its own word: a bare "kommen" is also origin ("komme aus") or a companion ("kommt mit").
  zusage: ['zusag', 'gern', 'dabei', 'teilnehm'],
  anmeld: ['anmeld', 'anmeldung', 'anmelden', 'meld', 'registrier', 'einschreib'],
  grund: ['grund', 'warum', 'weil', 'denn', 'moecht', 'woll', 'interess', 'urlaub', 'reis', 'besuch', 'einlad', 'feie', 'krank', 'absag', 'buch'],
  ort: ['ort', 'wo', 'adress', 'stadt', 'strass', 'wohn', 'hotel', 'bahn', 'flughaf', 'zimm', 'haus'],
});
