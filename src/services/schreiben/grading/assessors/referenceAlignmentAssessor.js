/**
 * Leitpunkt assessor without a model: aligns the letter's sentences and clauses with the task's reference phrases
 * (grading/referenceAlignment/). No rubric keywords. The evidence head's fallback when the embedding model is not
 * there; reads no purpose of the letter and measures no keyword anchor.
 */

import { ILeitpunktAssessor } from './leitpunktAssessorInterface.js';
import { alignLetter } from '../referenceAlignment/unitAlignment.js';
import { loadTaskPhrases } from '../evidenceHead/taskReferences.js';
import { resolveLpDiagnosticCode } from '../../feedback/feedbackContracts.js';
import { requireLevelPort } from '../levelPorts.js';

function toVerdict(criterion, group) {
  return {
    id: criterion.id,
    label: criterion.label || criterion.id,
    score: group.level,
    baselineScore: group.level,
    arbitrated: false,
    rankerScore: null,
    isProtected: false,
    diagnosticCode: resolveLpDiagnosticCode(group.level, { isInverted: false }, true),
    matchedSentence: group.level > 0 ? group.span : '',
    keywordSentences: [],
    frameErrors: [],
    rankerDetails: { engine: 'reference-alignment', units: group.readings },
  };
}

export class ReferenceAlignmentAssessor extends ILeitpunktAssessor {
  get id() {
    return 'reference-alignment';
  }

  async assess({ question, criteria, bodySentences, policy }) {
    const model = requireLevelPort(policy, 'ReferenceAlignmentAssessor: policy').referenceAlignment;
    if (!model) throw new Error(`Level ${policy.level} has no reference alignment data`);
    const phrases = await loadTaskPhrases({ question, criteria });
    if (!phrases) throw new Error(`No reference phrases for task ${question.id}`);
    const groups = alignLetter({ phrases, sentences: bodySentences, lexicon: policy.lexicon, model });
    return {
      items: criteria.map((c, i) => toVerdict(c, groups[i])),
      semanticErrors: [],
      modelUsed: false,
      modelFailureDetail: null,
      servesTaskPurpose: null,
    };
  }
}
