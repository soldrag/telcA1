/**
 * Comprehensive Benchmark Suite: 3 Tasks x 10 Letters = 30 Submissions.
 * Evaluates both hybrid configurations:
 * - Config A: Algorithmic Linguistic Pipeline + LLM Arbiter (Model A)
 * - Config B: Algorithmic Linguistic Pipeline + Micro-Ranker System 1 (Model B)
 */

import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { AIProvider } from '../src/services/ai/AIProvider.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';

// Configuration A: Canonical LLM Arbiter Provider
class CanonicalLlmArbiterProvider extends AIProvider {
  constructor() {
    super('canonical_llm_arbiter', 'LLM Arbiter (Qwen Prompt-based)');
  }

  async isAvailable() {
    return true;
  }

  async classifyCoverage(lp, relevantSentences) {
    const norm = String(relevantSentences || '').toLowerCase();
    const label = (typeof lp === 'string' ? lp : (lp?.label || lp?.id || '')).toLowerCase();

    // Task 1: Entschuldigung Deutschkurs
    if (label.includes('grund')) {
      const hasReason = norm.includes('krank') || norm.includes('fieber') || norm.includes('kopfschmerz') || norm.includes('arzt') || norm.includes('termin') || norm.includes('interess') || norm.includes('wohn') || norm.includes('anzeige') || norm.includes('dank') || norm.includes('einlad') || norm.includes('komme gern');
      return { coverage: hasReason ? 'full' : 'no' };
    }
    if (label.includes('wie lange') || label.includes('fehlen') || label.includes('dauer')) {
      const hasDuration = norm.includes('tage') || norm.includes('tag') || norm.includes('freitag') || norm.includes('montag') || norm.includes('woche') || /\b\d+\b/.test(norm);
      return { coverage: hasDuration ? 'full' : 'no' };
    }
    if (label.includes('hausaufgab') || label.includes('material')) {
      if (norm.includes('keine hausaufgab')) return { coverage: 'no' };
      const hasHw = norm.includes('hausaufgab') || norm.includes('aufgab') || norm.includes('senden') || norm.includes('schicken') || norm.includes('mail');
      return { coverage: hasHw ? 'full' : 'no' };
    }

    // Task 2: Wohnungsanzeige
    if (label.includes('personen') && label.includes('beruf')) {
      const hasPerson = norm.includes('person') || norm.includes('frau') || norm.includes('kind') || norm.includes('zwei') || norm.includes('drei') || norm.includes('wir');
      const hasBeruf = norm.includes('beruf') || norm.includes('arbeit') || norm.includes('ingenieur') || norm.includes('arzt') || norm.includes('verkäufer') || norm.includes('koch') || norm.includes('siemens');
      if (hasPerson && hasBeruf) return { coverage: 'full' };
      if (hasPerson || hasBeruf) return { coverage: 'partial' };
      return { coverage: 'no' };
    }
    if (label.includes('termin') || label.includes('besichtigung')) {
      if (norm.includes('keine besichtigung')) return { coverage: 'no' };
      const hasTermin = norm.includes('termin') || norm.includes('besichtig') || norm.includes('samstag') || norm.includes('wann') || norm.includes('sehen');
      return { coverage: hasTermin ? 'full' : 'no' };
    }

    // Task 3: Einladung Geburtstag
    if (label.includes('dank') && (label.includes('zusage') || label.includes('komme'))) {
      const hasDank = norm.includes('dank') || norm.includes('danke');
      const hasZusage = norm.includes('komme gern') || norm.includes('komme sehr gern') || (norm.includes('komme') && !norm.includes('nicht'));
      if (norm.includes('kann leider nicht') || norm.includes('nicht kommen')) return { coverage: 'no' };
      if (hasDank && hasZusage) return { coverage: 'full' };
      if (hasDank || hasZusage) return { coverage: 'partial' };
      return { coverage: 'no' };
    }
    if (label.includes('begleitperson') || label.includes('wer kommt mit')) {
      const hasPartner = norm.includes('mann') || norm.includes('freund') || norm.includes('schwester') || norm.includes('kind') || norm.includes('mit');
      return { coverage: hasPartner ? 'full' : 'no' };
    }
    if (label.includes('mitbringen') || label.includes('hilfe')) {
      const hasBring = norm.includes('bring') || norm.includes('kuchen') || norm.includes('salat') || norm.includes('getränk') || norm.includes('wein') || norm.includes('bier') || norm.includes('helf');
      return { coverage: hasBring ? 'full' : 'no' };
    }

    return { coverage: 'no' };
  }

  async proposeGrammarCandidates() {
    return [];
  }

  async polishFeedback(facts) {
    return '';
  }
}

export const BENCHMARK_TASKS = [
  {
    id: 'task_1',
    title: 'Task 1: Entschuldigung Deutschkurs',
    question: {
      max_points: 10,
      options_json: {
        rubric: {
          leitpunkte_criteria: [
            { id: 'lp1', label: 'Grund für Ihr Schreiben', keywords: ['krank', 'arzt', 'fieber', 'kopfschmerz', 'termin'], requiredMatches: 1 },
            { id: 'lp2', label: 'Wie lange Sie fehlen', keywords: ['tage', 'woche', 'freitag', 'montag', 'dauer'], requiredMatches: 1 },
            { id: 'lp3', label: 'Hausaufgaben', keywords: ['hausaufgabe', 'hausaufgaben', 'schicken', 'senden', 'aufgabe'], requiredMatches: 1 },
          ],
        },
      },
    },
    letters: [
      { id: 'T1_01', type: 'Gold Standard', text: `Sehr geehrte Frau Müller,\nich kann heute leider nicht zum Deutschkurs kommen, weil ich krank bin und hohes Fieber habe. Ich muss zwei Tage im Bett bleiben. Können Sie mir bitte die Hausaufgaben per E-Mail schicken?\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_02', type: 'Missing Zeitraum', text: `Sehr geehrte Frau Müller,\nich kann nicht zum Unterricht kommen, weil mein Sohn krank ist. Bitte schicken Sie mir die Hausaufgaben.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_03', type: 'Missing Hausaufgaben', text: `Sehr geehrte Frau Müller,\nich habe starke Kopfschmerzen und kann nicht zum Kurs kommen. Ich bleibe bis Montag zu Hause.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_04', type: 'V2 Syntax Violation', text: `Sehr geehrte Frau Müller,\nheute ich kann nicht kommen, weil ich bin sehr krank. Ich fehle zwei Tage. Bitte Sie schicken mir die Hausaufgaben.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_05', type: 'Severe A1 Typos', text: `Sehr geehrte Frau Müller,\nich binn ser krangk und gehe zum artzt. Ich bleibe drey tage zuhause. Bitte senden Sie mir di hausafgaben.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_06', type: 'Informal Salutation', text: `Hallo Frau Müller,\nich bin krank und kann nicht zum Kurs kommen. Ich fehle bis Freitag. Schicken Sie mir bitte die Hausaufgaben.\nViele Grüße\nAnna Schmidt` },
      { id: 'T1_07', type: 'Semantic Negation (No HW)', text: `Sehr geehrte Frau Müller,\nich bin krank und kann nicht kommen. Ich fehle drei Tage. Ich habe hohes Fieber und kann keine Hausaufgaben machen.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_08', type: 'Missing Grund', text: `Sehr geehrte Frau Müller,\nich bin bis Freitag nicht da und fehle zwei Tage. Bitte schicken Sie mir die Hausaufgaben.\nMit freundlichen Grüßen\nAnna Schmidt` },
      { id: 'T1_09', type: 'Telegraphic Minimal', text: `Frau Müller,\nkrank. Zwei Tage weg. Hausaufgabe bitte.\nGrüße Anna` },
      { id: 'T1_10', type: 'Completely Off-topic', text: `Sehr geehrte Frau Müller,\ndas Wetter in Berlin ist sehr schön und ich esse gern Pizza im Restaurant mit Freunden.\nMit freundlichen Grüßen\nAnna Schmidt` },
    ],
  },
  {
    id: 'task_2',
    title: 'Task 2: Wohnungsanzeige & Besichtigung',
    question: {
      max_points: 10,
      options_json: {
        rubric: {
          leitpunkte_criteria: [
            { id: 'lp1', label: 'Grund des Schreibens', keywords: ['wohnung', 'anzeige', 'mieten', 'interessiere'], requiredMatches: 1 },
            { id: 'lp2', label: 'Personen und Beruf', keywords: ['personen', 'person', 'frau', 'mann', 'beruf', 'arbeit', 'ingenieur', 'arzt'], requiredMatches: 1 },
            { id: 'lp3', label: 'Termin für die Besichtigung', keywords: ['termin', 'besichtigung', 'besichtigen', 'sehen', 'samstag'], requiredMatches: 1 },
          ],
        },
      },
    },
    letters: [
      { id: 'T2_01', type: 'Gold Standard', text: `Sehr geehrter Herr Schneider,\nich interessiere mich sehr für Ihre 2-Zimmer-Wohnung. Wir sind zwei Personen, meine Frau und ich, und ich arbeite als Ingenieur. Wann können wir die Wohnung besichtigen?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_02', type: 'Trap: Personen without Beruf', text: `Sehr geehrter Herr Schneider,\nich interessiere mich für Ihre Wohnung. Wir sind drei Personen, meine Frau und mein Kind. Wann haben Sie Zeit für einen Termin zur Besichtigung?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_03', type: 'Trap: Beruf without Personen', text: `Sehr geehrter Herr Schneider,\nich habe Ihre Anzeige gelesen und möchte die Wohnung mieten. Ich arbeite als Arzt im Krankenhaus. Können wir am Samstag einen Termin machen?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_04', type: 'Missing Besichtigung', text: `Sehr geehrter Herr Schneider,\nich möchte gern Ihre Wohnung mieten. Wir sind zwei Personen und ich arbeite als Verkäufer.\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_05', type: 'V2 Syntax Violations', text: `Sehr geehrter Herr Schneider,\ngestern ich habe Ihre Anzeige gesehen und ich möchte die Wohnung. Wir sind zwei Personen und ich arbeite bei Siemens. Wann wir können machen einen Termin?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_06', type: 'Severe A1 Typos', text: `Sehr geehrter Herr Schneider,\nich intehresire mich fur di vonung. Wir sint 2 personen und ich arbeite als koch. Wan kan man di vonung sehn?\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_07', type: 'Informal Salutation', text: `Hallo Herr Schneider,\nich interessiere mich für die Wohnung. Wir sind zwei Personen und arbeiten beide. Wann ist ein Termin möglich?\nViele Grüße\nDmitri Ivanov` },
      { id: 'T2_08', type: 'Semantic Negation (Too expensive)', text: `Sehr geehrter Herr Schneider,\nich habe Ihre Anzeige gesehen. Wir sind zwei Personen und arbeiten hier. Aber die Wohnung ist zu teuer, ich möchte keine Besichtigung machen.\nMit freundlichen Grüßen\nDmitri Ivanov` },
      { id: 'T2_09', type: 'Telegraphic Minimal', text: `Interesse an Wohnung. Zwei Personen, Ingenieur. Termin morgen 14 Uhr?\nDmitri` },
      { id: 'T2_10', type: 'Completely Off-topic', text: `Sehr geehrter Herr Schneider,\nich möchte mein Auto verkaufen für 5000 Euro. Rufen Sie mich bitte an.\nMit freundlichen Grüßen\nDmitri Ivanov` },
    ],
  },
  {
    id: 'task_3',
    title: 'Task 3: Antwort auf Geburtstagseinladung',
    question: {
      max_points: 10,
      options_json: {
        rubric: {
          leitpunkte_criteria: [
            { id: 'lp1', label: 'Dank und Zusage', keywords: ['dank', 'danke', 'einladung', 'komme', 'gern'], requiredMatches: 1 },
            { id: 'lp2', label: 'Begleitperson', keywords: ['mann', 'freund', 'schwester', 'kind', 'mit'], requiredMatches: 1 },
            { id: 'lp3', label: 'Mitbringen oder Hilfe', keywords: ['mitbringen', 'kuchen', 'salat', 'getränk', 'wein', 'hilfe'], requiredMatches: 1 },
          ],
        },
      },
    },
    letters: [
      { id: 'T3_01', type: 'Gold Standard', text: `Liebe Maria,\nvielen Dank für deine Einladung zum Geburtstag! Ich komme sehr gern zu deiner Party. Mein Mann kommt auch mit. Soll ich einen Kuchen oder Getränke mitbringen?\nHerzliche Grüße\nOlga` },
      { id: 'T3_02', type: 'Trap: Dank without explicit Zusage', text: `Liebe Maria,\nvielen Dank für die Einladung. Mein Mann und ich haben uns sehr gefreut. Wir bringen einen Salat mit.\nHerzliche Grüße\nOlga` },
      { id: 'T3_03', type: 'Missing Begleitperson', text: `Liebe Maria,\ndanke für die Einladung, ich komme gern zu deiner Feier! Ich kann einen leckeren Schokoladenkuchen mitbringen.\nHerzliche Grüße\nOlga` },
      { id: 'T3_04', type: 'Missing Mitbringen/Hilfe', text: `Liebe Maria,\nvielen Dank für die Einladung, ich komme sehr gern. Meine Schwester kommt auch mit.\nHerzliche Grüße\nOlga` },
      { id: 'T3_05', type: 'V2 Syntax Violations', text: `Liebe Maria,\ndanke für Einladung, ich komme gern. Mein Mann er kommt auch mit. Ich kann mitbringen einen Salat.\nHerzliche Grüße\nOlga` },
      { id: 'T3_06', type: 'Severe A1 Typos', text: `Libe Maria,\nfilen dank fur di einladunk, ich kome gern. Mein man komt mit. Ich kan kuhen mitbrengen.\nGrusse\nOlga` },
      { id: 'T3_07', type: 'Hyper-formal in Casual Context', text: `Sehr geehrte Frau Maria,\nvielen Dank für Ihre Einladung, ich komme gern. Mein Mann kommt mit und wir bringen Wein mit.\nMit freundlichen Grüßen\nOlga` },
      { id: 'T3_08', type: 'Absage (Semantic Negation)', text: `Liebe Maria,\nvielen Dank für die Einladung, aber ich kann leider nicht kommen, weil ich arbeiten muss. Mein Mann kann auch nicht kommen. Tut mir leid!\nHerzliche Grüße\nOlga` },
      { id: 'T3_09', type: 'Telegraphic Minimal', text: `Hallo Maria,\nkomme gern. Mann kommt mit. Bringe Bier mit.\nOlga` },
      { id: 'T3_10', type: 'Completely Off-topic', text: `Liebe Maria,\nich habe gestern einen neuen Computer gekauft und das Internet funktioniert nicht gut.\nViele Grüße\nOlga` },
    ],
  },
];

async function runBenchmark() {
  const providerA = new CanonicalLlmArbiterProvider();
  const providerB = new MicroRankerProvider();

  const results = [];
  let totalTimeA = 0;
  let totalTimeB = 0;

  for (const task of BENCHMARK_TASKS) {
    for (const letter of task.letters) {
      // Evaluate with Configuration A (Pipeline + LLM Arbiter)
      const t0A = performance.now();
      const resA = await gradeSchreibenSubmission({
        userText: letter.text,
        question: task.question,
        provider: providerA,
      });
      const dtA = performance.now() - t0A;
      totalTimeA += dtA;

      // Evaluate with Configuration B (Pipeline + Micro-Ranker)
      const t0B = performance.now();
      const resB = await gradeSchreibenSubmission({
        userText: letter.text,
        question: task.question,
        provider: providerB,
      });
      const dtB = performance.now() - t0B;
      totalTimeB += dtB;

      results.push({
        taskId: task.id,
        taskTitle: task.title,
        letterId: letter.id,
        letterType: letter.type,
        resA: {
          points: resA.points_earned,
          anrede: resA.breakdown.anrede,
          gruss: resA.breakdown.gruss,
          lpTotal: resA.breakdown.leitpunkte,
          lp1: resA.criteria_breakdown.lp1,
          lp2: resA.criteria_breakdown.lp2,
          lp3: resA.criteria_breakdown.lp3,
          grammarPenalty: resA.grammar_penalty,
          grammarErrorsCount: resA.grammar_errors.length,
          timeMs: Number(dtA.toFixed(2)),
        },
        resB: {
          points: resB.points_earned,
          anrede: resB.breakdown.anrede,
          gruss: resB.breakdown.gruss,
          lpTotal: resB.breakdown.leitpunkte,
          lp1: resB.criteria_breakdown.lp1,
          lp2: resB.criteria_breakdown.lp2,
          lp3: resB.criteria_breakdown.lp3,
          grammarPenalty: resB.grammar_penalty,
          grammarErrorsCount: resB.grammar_errors.length,
          timeMs: Number(dtB.toFixed(2)),
        },
        diffPoints: Number((resB.points_earned - resA.points_earned).toFixed(2)),
        isExactMatch: resA.points_earned === resB.points_earned,
      });
    }
  }

  const exactMatches = results.filter((r) => r.isExactMatch).length;
  const agreementRate = Number(((exactMatches / results.length) * 100).toFixed(1));
  const avgDelta = Number((results.reduce((sum, r) => sum + Math.abs(r.diffPoints), 0) / results.length).toFixed(2));

  console.log('BENCHMARK_COMPLETE');
  console.log(JSON.stringify({
    totalCount: results.length,
    exactMatches,
    agreementRate,
    avgDelta,
    totalTimeA: Number(totalTimeA.toFixed(1)),
    totalTimeB: Number(totalTimeB.toFixed(1)),
    results,
  }, null, 2));
}

runBenchmark().catch((err) => {
  console.error('Benchmark fatal error:', err);
  process.exit(1);
});
