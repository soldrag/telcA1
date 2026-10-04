import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';
import { NoneProvider } from '../src/services/ai/providers/NoneProvider.js';
import { questions as s5Questions } from '../src/data/exams/seeds/schreiben-modellsatz-5.js';
import { questions as s6Questions } from '../src/data/exams/seeds/schreiben-modellsatz-6.js';
import { questions as s7Questions } from '../src/data/exams/seeds/schreiben-modellsatz-7.js';

const q5 = s5Questions.find((q) => q.teil === 2);
const q6 = s6Questions.find((q) => q.teil === 2);
const q7 = s7Questions.find((q) => q.teil === 2);

const testCases = [
  // --- Modellsatz 5 ---
  {
    exam: 'Modellsatz 5 (Krankmeldung)',
    question: q5,
    name: 'MS5-A: Hohe Punktzahl (Sehr gut, 10/10)',
    text: `Sehr geehrte Frau Berg,
ich bin leider krank und habe Kopfschmerzen. Ich kann heute und morgen nicht in den Unterricht kommen. Bitte schicken Sie mir die Hausaufgaben per E-Mail.
Mit freundlichen Grüßen
Sarah Lindemann`
  },
  {
    exam: 'Modellsatz 5 (Krankmeldung)',
    question: q5,
    name: 'MS5-B: Mittlere Punktzahl (Befriedigend ~7.5/10 — informelle Anrede/Gruß + knapper LP3)',
    text: `Hallo Frau Berg,
ich bin sehr krank und kann nicht kommen. Ich komme am Montag wieder. Was sind die Hausaufgaben?
Viele Grüße
Sarah`
  },
  {
    exam: 'Modellsatz 5 (Krankmeldung)',
    question: q5,
    name: 'MS5-C: Niedrige Punktzahl (Nicht bestanden ~5.5/10 — LP3 Hausaufgaben fehlt)',
    text: `Hallo Frau Berg,
ich bin krank und bleibe drei Tage zu Hause.
Viele Grüße
Sarah`
  },
  {
    exam: 'Modellsatz 5 (Krankmeldung)',
    question: q5,
    name: 'MS5-D: 0 Punkte (Thema verfehlt / Off-topic)',
    text: `Guten Tag,
ich möchte ein Fahrrad kaufen. Wie viel kostet das rote Fahrrad? Ich komme am Samstag um 10 Uhr.
Viele Grüße
Anna`
  },

  // --- Modellsatz 6 ---
  {
    exam: 'Modellsatz 6 (Hotelreservierung)',
    question: q6,
    name: 'MS6-A: Hohe Punktzahl (Sehr gut, 10/10)',
    text: `Sehr geehrte Damen und Herren,
ich möchte im August ein Zimmer bei Ihnen buchen. Wir kommen vom 10. bis 17. August für eine Woche. Gibt es im Hotel ein Frühstück und haben Sie einen Parkplatz?
Mit freundlichen Grüßen
Thomas Becker`
  },
  {
    exam: 'Modellsatz 6 (Hotelreservierung)',
    question: q6,
    name: 'MS6-B: Gute/Mittlere Punktzahl (8.5/10 — Parkplatz vergessen, Frühstück vorhanden)',
    text: `Sehr geehrte Damen und Herren,
ich möchte ein Einzelzimmer für meinen Urlaub reservieren. Ich komme am 15. August und bleibe vier Tage. Was kostet das Zimmer mit Frühstück?
Mit freundlichen Grüßen
Thomas Becker`
  },
  {
    exam: 'Modellsatz 6 (Hotelreservierung)',
    question: q6,
    name: 'MS6-C: Niedrige Punktzahl (4/10 — nur Grund genannt, keine Termine, kein Frühstück/Parkplatz)',
    text: `Sehr geehrte Damen und Herren,
ich möchte ein Zimmer reservieren.
Mit freundlichen Grüßen
Thomas Becker`
  },
  {
    exam: 'Modellsatz 6 (Hotelreservierung)',
    question: q6,
    name: 'MS6-D: 0 Punkte (Thema verfehlt — Waschmaschine kaputt)',
    text: `Sehr geehrte Damen und Herren,
meine Waschmaschine in der Küche ist kaputt. Bitte schicken Sie einen Techniker am Montag.
Mit freundlichen Grüßen
Thomas`
  },

  // --- Modellsatz 7 ---
  {
    exam: 'Modellsatz 7 (Wohnungsbesichtigung)',
    question: q7,
    name: 'MS7-A: Hohe Punktzahl (Sehr gut, 10/10)',
    text: `Sehr geehrte Frau Neumann,
ich habe Ihre Anzeige gelesen und möchte die 2-Zimmer-Wohnung mieten. Ich ziehe mit meinem Mann ein, wir sind zwei Personen und ich arbeite als Krankenschwester. Wann können wir die Wohnung besichtigen?
Mit freundlichen Grüßen
Elena Rossi`
  },
  {
    exam: 'Modellsatz 7 (Wohnungsbesichtigung)',
    question: q7,
    name: 'MS7-B: Gute Punktzahl mit A1-Konversivfehler (8.5/10 — "vermieten" statt "mieten")',
    text: `Sehr geehrte Frau Neumann,
ich möchte Ihre Wohnung vermieten. Wir sind drei Personen und mein Mann ist Mechaniker. Haben Sie am Montag Zeit für einen Termin?
Mit freundlichen Grüßen
Elena Rossi`
  },
  {
    exam: 'Modellsatz 7 (Wohnungsbesichtigung)',
    question: q7,
    name: 'MS7-C: Mittlere Punktzahl (8.5/10 — Beruf ausgelassen, nur Personen genannt)',
    text: `Sehr geehrte Frau Neumann,
ich interessiere mich für die Wohnung. Wir sind zwei Personen. Haben Sie am Wochenende Zeit für eine Besichtigung?
Mit freundlichen Grüßen
Elena Rossi`
  },
  {
    exam: 'Modellsatz 7 (Wohnungsbesichtigung)',
    question: q7,
    name: 'MS7-D: 1 Punkt (Nur Rahmen, keine Prädikation im Inhalt — Wortliste)',
    text: `Sehr geehrte Frau Neumann,
Wohnung 2 Zimmer Besichtigung Montag.
Mit freundlichen Grüßen
Elena Rossi`
  },

  // --- Realistische A1-Grammatikfehler (Feedback-Validierung) ---
  {
    exam: 'Modellsatz 5 (Krankmeldung)',
    question: q5,
    name: 'MS5-E: Reale A1-Grammatikfehler (Wortstellung: "Morgen ich komme", Präposition: "mit die")',
    text: `Sehr geehrte Frau Berg,
ich bin leider krank und habe Fieber. Morgen ich komme nicht. Bitte schicken Sie die Hausaufgaben mit die Post.
Mit freundlichen Grüßen
Sarah Lindemann`
  },
  {
    exam: 'Modellsatz 7 (Wohnungsbesichtigung)',
    question: q7,
    name: 'MS7-E: Reale A1-Grammatikfehler (Dativ-Endung: "mit mein Mann", Präposition: "an Montag")',
    text: `Sehr geehrte Frau Neumann,
ich möchte die Wohnung mieten. Ich ziehe mit mein Mann ein und ich arbeite als Lehrerin. Haben Sie an Montag Zeit für eine Besichtigung?
Mit freundlichen Grüßen
Elena Rossi`
  }
];

async function runGradeBenchmark() {
  console.log('================================================================================');
  console.log('       TESTING NEW SCHREIBEN TASKS (MODELLSÄTZE 5, 6, 7) ACROSS GRADE SPECTRUM  ');
  console.log('================================================================================\n');

  for (const tc of testCases) {
    const res = await gradeSchreibenSubmission({
      userText: tc.text,
      question: tc.question,
      provider: new NoneProvider()
    });

    console.log(`📌 ${tc.name}`);
    console.log(`   Aufgabe: ${tc.exam}`);
    console.log(`   Punkte: ${res.points_earned} / ${res.max_points}`);
    console.log(`   Leitpunkte: ${res.breakdown.leitpunkte} Pkt. | KG: ${res.breakdown.kommunikative_gestaltung.points} Pkt. (${res.breakdown.kommunikative_gestaltung.rating})`);
    
    if (res.breakdown.leitpunkte_void_reason) {
      console.log(`   ⚡ Leitpunkte Void Reason: ${res.breakdown.leitpunkte_void_reason}`);
    }

    res.breakdown.items.forEach((item, idx) => {
      console.log(`     • LP${idx + 1} (${item.label}): ${item.points} Pkt. (Stufe ${item.score}) [Diag: ${item.diagnosticCode || 'OK'}]`);
    });

    if (res.grammar_errors && res.grammar_errors.length > 0) {
      console.log(`   ⚠️ Grammatik-Hinweise (${res.grammar_errors.length}):`);
      res.grammar_errors.forEach(err => {
        console.log(`     - [${err.code || err.category}] „${err.original}“ ➔ „${err.correction}“ (${err.explanation})`);
      });
    } else {
      console.log(`   ✔ Grammatikfehler: keine`);
    }

    console.log('-'.repeat(80));
  }
}

await runGradeBenchmark();
