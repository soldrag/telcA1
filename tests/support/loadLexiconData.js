// Engine modules read the general dictionaries synchronously; the grading pipeline loads them first,
// unit tests that call the engine directly load them here (node --import).
import { loadLexiconData } from '../../src/services/schreiben/linguistic/a1LexiconService.js';

await loadLexiconData();
