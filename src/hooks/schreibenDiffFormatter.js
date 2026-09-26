import { scoreCriteriaLevels } from '../services/schreiben/regulations/index.js';
import { formatPoints } from '../utils/formatPoints.js';

const CRITERION_LABELS = {
  anrede: 'Anrede',
  lp1: 'Punkt 1',
  lp2: 'Punkt 2',
  lp3: 'Punkt 3',
  gruss: 'Grußformel',
};

const RANKER_VERDICT = {
  ru: { 2: 'полностью', 1: 'частично', 0: 'не раскрыт' },
  de: { 2: 'vollständig', 1: 'teilweise', 0: 'nicht erfüllt' },
};

function toPoints(level, lang) {
  return formatPoints(scoreCriteriaLevels({ lp1: level }).leitpunkte[0].points, lang);
}

export function formatDiffEntry(d, lang, item = null) {
  let label = CRITERION_LABELS[d.id] || d.id;
  if (d.id?.startsWith('lp') && item) {
    const idx = parseInt(d.id.replace('lp', ''), 10) - 1;
    const title = item.options_json?.leitpunkte?.[idx]
      || item.leitpunkte?.[idx]
      || item.criteria?.[idx]?.label
      || item.criteria_breakdown?.items?.[idx]?.label;
    if (title && typeof title === 'string') {
      const cleanTitle = title.replace(/^\d+[\.\)]\s*/, '').trim();
      label = `${CRITERION_LABELS[d.id]} (${cleanTitle})`;
    }
  }
  const from = toPoints(d.from ?? 0, lang);
  const to = toPoints(d.to ?? 0, lang);
  const verdict = (RANKER_VERDICT[lang] || RANKER_VERDICT.de)[d.rankerScore ?? 0];
  const msgs = {
    rescued:   lang === 'ru' ? `✨ ИИ нашёл ответ на ${label} и повысил балл: ${from} ➔ ${to}` : `✨ KI hat ${label} gefunden und hochgesetzt: ${from} ➔ ${to}`,
    adjusted:  lang === 'ru' ? `↕️ ${label}: ИИ скорректировал ${from} ➔ ${to}` : `↕️ ${label}: KI hat angepasst ${from} ➔ ${to}`,
    protected: lang === 'ru'
      ? `🛡️ ${label}: ранкер — ${verdict}, оставлено ${to} по ключевым словам`
      : `🛡️ ${label}: Ranker — ${verdict}, ${to} nach Schlüsselwörtern beibehalten`,
  };
  return msgs[d.change] || `${label}: ${from} ➔ ${to}`;
}
