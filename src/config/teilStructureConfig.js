import { Mail, Globe, FileText, FileSpreadsheet, Volume2, Radio, Phone } from 'lucide-react';

function getSchreibenGroups(t) {
  return [
    {
      teil: 1,
      label: 'Teil 1 (1–5)',
      sublabel: t?.('welcome.moduleSub_formular') || 'Formular',
      icon: FileSpreadsheet,
    },
    {
      teil: 2,
      label: 'Teil 2 (6)',
      sublabel: t?.('welcome.moduleSub_brief') || 'Brief / E-Mail',
      icon: Mail,
    },
  ];
}

function getHoerenGroups() {
  return [
    { teil: 1, label: 'Teil 1 (1–6)', sublabel: 'Gespräche', icon: Volume2 },
    { teil: 2, label: 'Teil 2 (7–10)', sublabel: 'Durchsagen', icon: Radio },
    { teil: 3, label: 'Teil 3 (11–15)', sublabel: 'Telefon', icon: Phone },
  ];
}

function getLesenGroups() {
  return [
    { teil: 1, label: 'Teil 1 (1–5)', sublabel: 'E-Mails & Briefe', icon: Mail },
    { teil: 2, label: 'Teil 2 (6–10)', sublabel: 'Webseiten / Anzeigen', icon: Globe },
    { teil: 3, label: 'Teil 3 (11–15)', sublabel: 'Schilder & Zettel', icon: FileText },
  ];
}

export function getTeilGroups(questions = [], testType = 'lesen', t = null) {
  const definitions = testType === 'schreiben'
    ? getSchreibenGroups(t)
    : (testType === 'hoeren' ? getHoerenGroups() : getLesenGroups());

  return definitions.map((def) => ({
    ...def,
    questions: questions.filter((q) => q.teil === def.teil),
  }));
}
