import { runStage0Preprocessing } from '../../src/services/schreiben/grading/stage0Preprocessing.js';
import { segmentUserEssay } from '../../src/services/schreiben/schreibenTextSegmenter.js';

/** Segments a raw letter the way the pipeline does: stage 0 body sentences, then the Leitpunkt assignment. */
export function segmentLetter(rawText, criteria, levelContext) {
  return segmentUserEssay(runStage0Preprocessing(rawText, levelContext).bodySentences, criteria, levelContext);
}
