# Teacher labelling guide (experiment 3, written 2026-11-09 before any teacher data)

Teacher = the session model, writing offline at build time. Sources allowed while writing: the task texts
(`data/tasks.json`: situation, Leitpunkt labels, rubric aspects, model answer breakdown), the bank unit keys of
`src/data/exams/example-bank/<task>.json`, and `reglament/telc-a1.md` §2 and §6. Not allowed: the open,
calibration or hidden letters (never opened while writing), the calibration sentences' wording.

## Units
Every sentence is labelled against **every bank unit of its task** (s1: lp1, lp2:Wann, lp2:wie lange,
lp3:Frage nach den Kurskosten, lp3:Anmeldung; s2: lp1, lp2, lp3; s3: lp1, lp2, lp3:Handwerker,
lp3:Reparaturtermin; s4: lp1, lp2:Personen, lp2:Zeitraum, lp3:Preis, lp3:Haustiere; s5: lp1, lp2, lp3;
s6: lp1, lp2:Wann, lp2:wie lange, lp3:Frühstück, lp3:Parkplatz; s7: lp1, lp2:Personen, lp2:Beruf, lp3).
A unit not named on a line is `I`.

## Classes (regulation §6 in brackets)
- `F` fulfilled — the sentence carries out the unit's communicative action, understandably ("Aufgabe voll
  erfüllt und verständlich"). Counts regardless of: spelling, missing articles/endings, word order, lower case,
  missing umlauts, telegraphic style without a verb ("Hund ok?", "morgen auch krank"), §2 ("errors that do not
  hinder understanding"). Counts for a **paraphrase without task words** ("Hund" for "Haustiere", "Was muss ich
  zahlen?" for "Kurskosten") and for **implicit fulfilment** where the aim is clear (a question "Wann kann
  jemand kommen?" fulfils "Reparaturtermin"; "Ich bin krank" in s5 fulfils the reason).
  **Negation as content is F**: "Wir haben keine Haustiere." covers "Haustiere"; "Ich habe kein Auto, aber …"
  is not about the Parkplatz action → see I.
- `P` partial — the point is addressed but only partly ("wegen sprachlicher und inhaltlicher Mängel nur
  teilweise erfüllt"): swapped roles / converse verb understandable from the task ("Ich möchte meine Wohnung
  vermieten" for renting; "Was kostet der Hund?"), or a recognisable but clearly deficient attempt at this
  very unit ("Ich komme irgendwann im Sommer" for a requested time frame). A sentence that does not attempt
  the unit at all is `I`, not `P`.
- `C` contradicted — the writer **refuses the required communicative action** ("Ich brauche keinen neuen
  Termin" when lp3 asks for a new appointment; "Ich sage nicht, warum"; "Ich komme doch pünktlich" when lp1 is
  cancelling; "Den Preis will ich nicht wissen"). Plain negation of a fact is not C (see F).
- `I` irrelevant — the sentence does not address the unit: other units of the task, past events, wishes about
  other topics, another purpose that reuses the task's words ("Ich habe meine Jacke in Ihrer Wohnung
  vergessen"), greetings, thanks, frame formulas.

## Letters
- On-task letters: each body sentence labelled as above; the expected Leitpunkt level is derived by the
  project's letter rule (compound only where the rubric declares aspects, `data/tasks.json`): single unit
  F → 2, P → 1, else 0; a non-compound Leitpunkt split into bank units (s1 lp2/lp3, s6 lp2) takes the best
  label over its bank units; a compound Leitpunkt (s3 lp3, s4 lp2+lp3, s6 lp3, s7 lp2): all aspects F → 2,
  any aspect F or P → 1, none → 0.
- Off-purpose letters (written for another purpose, reusing task words): **all sentences `I` for all units**
  (regulation: "a letter on the wrong topic → Leitpunkte 0"), expected levels 0 0 0. They are written so that
  no sentence, read alone, carries a unit's action (past tense, complaints, cancellations, thanks).
- Frame lines (Anrede, Gruß, name) are marked `|` and are not training rows.

## Coverage quota per task (fixed before writing)
- Per bank unit: 12 `F` (≈3 standard, ≈3 paraphrase/implicit without the rubric word, ≈4 heavy A1 errors or
  telegraphic, ≈2 negation-as-content or embedded in a longer sentence), 2 `P`, 2 `C`.
- Per task: 12 hard `I` (task words, another purpose, past, other topic, a sibling unit's words without its
  action) and 3 neutral sentences.
- Per task: 10 short letters (~25–50 words): 6 on-task (at least 2 missing or partial on one point, at least 1
  implicit, at least 1 heavy errors / telegraphic) and 4 off-purpose reusing task words.
- A sentence may carry several labels (e.g. lp1=F and lp2:Zeitraum=F).

## File format (`teacher/<task>.txt`)
`@alias X=<bank unit> …` (one-letter aliases, first line), then `<labels> :: <sentence>` — labels
`X=F|P|C`, space-separated, `-` for all I. `@letter on|off <lv1> <lv2>
<lv3>` … `@end` wraps a letter; inside it `| <text>` is a frame line.
