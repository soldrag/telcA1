// Official German Teil titles per module, shared by the score chips and the home progress card.
export const TEIL_TITLES_BY_MODULE = {
  schreiben: { 1: 'Teil 1: Formular', 2: 'Teil 2: Brief' },
  hoeren: { 1: 'Teil 1: Gespräche', 2: 'Teil 2: Durchsagen', 3: 'Teil 3: Telefon' },
  lesen: { 1: 'Teil 1: E-Mails / Briefe', 2: 'Teil 2: Internet / Webseiten', 3: 'Teil 3: Schilder / Aushänge' },
};

export function getTeilTitles(testType = 'lesen') {
  return TEIL_TITLES_BY_MODULE[testType] || TEIL_TITLES_BY_MODULE.lesen;
}
