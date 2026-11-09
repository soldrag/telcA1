/**
 * The current Leitpunkt assessor: rubric keywords, concept domains and structured detectors as the baseline, the
 * Micro-Ranker as the arbiter (grading/pipelineStageScorers.js).
 */

import { ILeitpunktAssessor } from './leitpunktAssessorInterface.js';
import { scorePipelineLeitpunkte } from '../pipelineStageScorers.js';

export class KeywordRankerAssessor extends ILeitpunktAssessor {
  get id() {
    return 'keyword-ranker';
  }

  async assess({ criteria, bodySentences, provider, customExtractor, userSegments = null, policy, onModelDownload = null }) {
    return scorePipelineLeitpunkte({ criteria, bodySentences, provider, customExtractor, userSegments, policy, onModelDownload });
  }
}
