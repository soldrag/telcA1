# Labelling guide — MERLIN telc A1 Schreiben Teil 2 letters

How the labels in `tests/fixtures/schreiben-merlin/merlin-a1.enc` were made (2026-11-09). The levels are model labels, not examiner scores.

You score real learner letters from the telc Deutsch A1 exam (Schreiben Teil 2) the way a trained telc examiner would.
The regulation is the project's telc A1 regulation (`reglament/telc-a1.md`, local) — read §2 and §6 completely before you start; it decides every case.

## The three tasks (exam wording)
- `merlin-a1-wohnung`: "Sie haben eine Arbeit in Neuburg gefunden. Sie brauchen eine Wohnung in Neuburg. Ihr Freund Ingo wohnt in Neuburg. Schreiben Sie Ihrem Freund Ingo eine E-Mail." Points: (1) Neue Wohnung – wann? (2) Größe der Wohnung (3) Hilfe bei der Wohnungssuche.
- `merlin-a1-schwimmen`: "Sie möchten mit Ihrer Freundin Daniela schwimmen gehen. Schreiben Sie Ihrer Freundin eine E-Mail." Points: (1) Wo (2) Wann (3) Was Ihre Freundin mitbringen soll.
- `merlin-a1-baby`: "Ihr Freund Jens ist Vater geworden. Schreiben Sie Ihrem Freund einen Brief." Points: (1) Glückwünsche (2) Name des Babys? (3) Wie es der Mutter des Babys geht?
Instruction to candidates: "Schreiben Sie zu jedem Punkt ein bis zwei Sätze … circa 30 Wörter. Vergessen Sie nicht den passenden Anfang und den Gruß am Schluss."

## What to give per letter
- `lp`: three levels, one per point, in task order: `2` = fulfilled and understandable (3 points), `1` = only partly fulfilled because of language or content shortcomings (1.5), `0` = not fulfilled and/or not understandable (0).
- `kg` (Kommunikative Gestaltung): `1` appropriate opening and closing formulas for the text type and addressee; `0.5` atypical or one of them missing; `0` no text-type formulas at all. The signature (name) is not a criterion. These are letters to a friend: "Lieber/Liebe …", "Hallo …" and "Viele/Liebe Grüße", "Bis bald", "Tschüss" are appropriate.
- `category`: exactly one of `complete`, `paraphrase`, `missing_point`, `partial_point`, `negation`, `off_topic`, `heavy_errors`, `telegraphic`, `frame_issue`, `borderline` — the most telling feature of the letter.
- `reason`: one short English sentence per point and for kg, saying why (quote the decisive words).

## Rules of thumb from the regulation (§6)
- Score task fulfilment and comprehensibility, not correctness: spelling, endings, word order and articles do not lower a point when the meaning is clear to a native speaker who does not know the candidate's language.
- Synonyms and paraphrases count; implicit fulfilment that is clear from context counts.
- A compound point with one part present and one missing is `1`. The three points here are simple, except where the wording itself asks for two things.
- Negation is content ("Ich brauche keine Hilfe" is an answer, but refusing the required action is `0`).
- Distorted but understandable meaning is `1`; incomprehensible is `0`.
- A point stated only vaguely may be `1` (user decision 2026-11-09).
- Only a frame without content → points 0, kg may still be 1. A letter on another topic → points 0.
- Length is not a criterion; extra sentences do not lower the score.
- When a case is genuinely borderline, give the level you find most defensible and say so in the reason.

## Independence
Judge each letter on its own. Do not run, read or call any grading code of the project, do not look at any other label file, and do not use any rating found elsewhere. Do not look up these letters on the web.

## Process and outcome
- Letters: the 207 German MERLIN v1.2 texts whose task ID is 1071_020200, 1071_120302 or 1071_030101, without their CEFR ratings. Four were dropped (1071_0024756, 1071_0024757, 1071_0024758, 1071_0024765): both labellers independently found that their text answers the other task than the corpus metadata says. 203 letters remain.
- `tasks.js` (rubrics, keywords, example phrases) was written from the task prompts and hashed before the labelling started.
- Two labellers judged every letter by hand, independently (one in reverse order), by this guide. Agreement: Leitpunkt levels 95.7 % (no 2↔0 disagreement), Kommunikative Gestaltung 88.7 %; 159 letters agreed fully.
- A third, adjudicating pass decided the 44 disputed letters. Rules it set: a formal closing ("Mit freundlichen Grüßen", "MFG") to a friend is an atypical formula → kg 0.5 (the mirror of the regulation's "Liebe … to a stranger"); "Hallo" and informal closings are appropriate. A question on the point instead of a statement → 1. Every lowering of a point names a regulation clause; without one the higher level stands.
