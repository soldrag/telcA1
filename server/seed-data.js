import { exam as exam1, questions as questions1 } from './seeds/modellsatz-1.js';
import { exam as exam2, questions as questions2 } from './seeds/modellsatz-2.js';
import { exam as exam3, questions as questions3 } from './seeds/modellsatz-3.js';
import { exam as exam4, questions as questions4 } from './seeds/modellsatz-4.js';
import { exam as exam5, questions as questions5 } from './seeds/modellsatz-5.js';
import { exam as exam6, questions as questions6 } from './seeds/modellsatz-6.js';
import { exam as exam7, questions as questions7 } from './seeds/modellsatz-7.js';
import { exam as exam8, questions as questions8 } from './seeds/modellsatz-8.js';
import { exam as exam9, questions as questions9 } from './seeds/modellsatz-9.js';
import { exam as exam10, questions as questions10 } from './seeds/modellsatz-10.js';
import { exam as sExam1, questions as sQuestions1 } from './seeds/schreiben-modellsatz-1.js';
import { exam as sExam2, questions as sQuestions2 } from './seeds/schreiben-modellsatz-2.js';
import { exam as sExam3, questions as sQuestions3 } from './seeds/schreiben-modellsatz-3.js';
import { exam as sExam4, questions as sQuestions4 } from './seeds/schreiben-modellsatz-4.js';
import { moduleExams, moduleQuestions } from './seeds/stubs-modules.js';

export const seedData = {
  exams: [
    { ...exam1, sort_order: 1 },
    { ...exam2, sort_order: 2 },
    { ...exam3, sort_order: 3 },
    { ...exam4, sort_order: 4 },
    { ...exam5, sort_order: 5 },
    { ...exam6, sort_order: 6 },
    { ...exam7, sort_order: 7 },
    { ...exam8, sort_order: 8 },
    { ...exam9, sort_order: 9 },
    { ...exam10, sort_order: 10 },
    { ...sExam1, sort_order: 1 },
    { ...sExam2, sort_order: 2 },
    { ...sExam3, sort_order: 3 },
    { ...sExam4, sort_order: 4 },
    ...moduleExams
  ],
  questions: [
    ...questions1,
    ...questions2,
    ...questions3,
    ...questions4,
    ...questions5,
    ...questions6,
    ...questions7,
    ...questions8,
    ...questions9,
    ...questions10,
    ...sQuestions1,
    ...sQuestions2,
    ...sQuestions3,
    ...sQuestions4,
    ...moduleQuestions
  ]
};
