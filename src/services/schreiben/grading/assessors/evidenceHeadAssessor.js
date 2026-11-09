/**
 * The keyword-free Leitpunkt assessor: one trained head (level data, IRankerPolicy.evidenceHead) reads every span of
 * the letter body against the task's reference phrases (grading/evidenceHead/). No rubric keywords, no concept
 * domains, no arbitration. It also reads the letter's purpose against the task's prototype letters. Without the
 * embedding model (limited mode, model failure) it hands the letter to reference alignment, also keyword-free.
 */

import { ILeitpunktAssessor } from './leitpunktAssessorInterface.js';
import { ReferenceAlignmentAssessor } from './referenceAlignmentAssessor.js';
import { letterSpans, readLetterGroups } from '../evidenceHead/letterReading.js';
import { loadTaskReferences } from '../evidenceHead/taskReferences.js';
import { resolveLpDiagnosticCode } from '../../feedback/feedbackContracts.js';
import { requireLevelPort } from '../levelPorts.js';
import { computeFullDocumentVector, getSentenceExtractor, loadEmbeddingModel } from '../../../embeddings/embeddingService.js';
import { describeError } from '../../../../utils/describeError.js';
import { PROVIDER_IDS } from '../../../ai/types.js';

const closest = (v, refs) => Math.max(...refs.map((r) => r.reduce((s, x, i) => s + x * v[i], 0)));

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
    rankerDetails: { engine: 'evidence-head', units: group.readings },
  };
}

async function resolveExtractor({ provider, evidenceExtractor, customExtractor, onModelDownload }) {
  if (provider?.id === PROVIDER_IDS.NONE || customExtractor === false) return null;
  if (evidenceExtractor) return evidenceExtractor;
  await loadEmbeddingModel(onModelDownload);
  return getSentenceExtractor();
}

export class EvidenceHeadAssessor extends ILeitpunktAssessor {
  constructor(fallback = new ReferenceAlignmentAssessor()) {
    super();
    this._fallback = fallback;
  }

  get id() {
    return 'evidence-head';
  }

  async assess(input) {
    const { question, criteria, bodySentences, letterText = bodySentences.join(' '), policy } = input;
    const model = requireLevelPort(policy, 'EvidenceHeadAssessor: policy').evidenceHead;
    let extractor = null;
    try {
      extractor = model ? await resolveExtractor(input) : null;
    } catch (err) {
      return { ...(await this._fallback.assess(input)), modelFailureDetail: describeError(err) };
    }
    if (!extractor) return this._fallback.assess(input);
    try {
      return await this._read({ question, criteria, bodySentences, letterText, policy, model, extractor });
    } catch (err) {
      return { ...(await this._fallback.assess(input)), modelUsed: false, modelFailureDetail: describeError(err) };
    }
  }

  async _read({ question, criteria, bodySentences, letterText, policy, model, extractor }) {
    const embed = (text) => computeFullDocumentVector(text, extractor);
    const refs = await loadTaskReferences({ question, criteria, embed });
    if (!refs) throw new Error(`No evidence references for task ${question.id}`);
    const texts = letterSpans(bodySentences, { lexicon: policy.lexicon });
    const whole = new Set(bodySentences);
    const spans = await Promise.all(texts.map(async (text) => ({ text, vector: await embed(text), whole: whole.has(text) })));
    const groups = readLetterGroups({ head: model.head, thresholds: model.thresholds, groups: refs.groups, spans });
    const letter = await embed(letterText);
    return {
      items: criteria.map((c, i) => toVerdict(c, groups[i])),
      semanticErrors: [],
      modelUsed: true,
      modelFailureDetail: null,
      servesTaskPurpose: closest(letter, refs.purpose.onTask) >= closest(letter, refs.purpose.offTask),
    };
  }
}
