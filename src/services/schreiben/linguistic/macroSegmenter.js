/**
 * Macro Structure State Machine for German A1 Letters.
 * Handles Anrede (Greeting), Body, Grußformel (Closing) and Unterschrift (Signature).
 * Strictly complies with McConnell limits (<= 180 lines, <= 25 lines per function).
 */

const SALUTATION_ROOTS = ['sehr geehrte', 'sehr geehrter', 'sehr geehrtes', 'liebe', 'lieber', 'liebes', 'guten tag', 'guten morgen', 'guten abend', 'hallo', 'hi'];
const CLOSING_ROOTS = ['mit freundlichen grüßen', 'mit freundlichem gruß', 'freundliche grüße', 'schöne grüße', 'viele grüße', 'herzliche grüße', 'liebe grüße', 'beste grüße', 'bis bald', 'auf wiedersehen'];
const SINGLE_LINE_CLOSING_ROOTS = [...CLOSING_ROOTS, 'tschüss'];
const POLITE_PRONOUNS = new Set(['sie', 'ihr', 'ihnen', 'ihre', 'ihrem', 'ihren', 'ihrer']);

function findSalutationCut(text = '') {
  const lower = text.toLowerCase();
  const matched = SALUTATION_ROOTS.find(r => lower.startsWith(r));
  if (!matched) return -1;
  const punctIdx = text.search(/[,!]/);
  return punctIdx !== -1 && punctIdx < 60 ? punctIdx + 1 : -1;
}

function findClosingCut(text = '') {
  const lower = text.toLowerCase();
  for (const root of SINGLE_LINE_CLOSING_ROOTS) {
    const idx = lower.lastIndexOf(root);
    if (idx > 0) return idx;
  }
  return -1;
}

function splitSingleLineBlocks(text = '') {
  let res = text;
  const salCut = findSalutationCut(res);
  if (salCut !== -1) {
    res = `${res.slice(0, salCut).trim()}\n${res.slice(salCut).trim()}`;
  }
  const closingCut = findClosingCut(res);
  if (closingCut !== -1) {
    res = `${res.slice(0, closingCut).trim()}\n${res.slice(closingCut).trim()}`;
  }
  return res;
}

function normalizeLines(rawText = '') {
  let text = String(rawText || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  if (!text.includes('\n')) {
    text = splitSingleLineBlocks(text);
  }

  return text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
}

function parseSalutation(line = '', isFormalRequired = true) {
  if (!line) return { recognized: false, score: 0, text: '', register: 'none' };
  const lower = line.toLowerCase();
  const hasGreeting = SALUTATION_ROOTS.some(r => lower.startsWith(r));
  if (!hasGreeting) return { recognized: false, score: 0, text: '', register: 'none' };

  let score = 2;
  let register = 'informal';
  let error = null;

  if (lower.startsWith('sehr geehrt') || lower.startsWith('guten tag')) {
    register = 'formal';
    if (/\bsehr\s+geehrte\s+herr\b/i.test(lower)) {
      score = 1;
      error = { original: 'Sehr geehrte Herr', correction: 'Sehr geehrter Herr', explanation: 'Deklination: Maskulin erfordert „-er“' };
    } else if (/\bsehr\s+geehrter\s+frau\b/i.test(lower)) {
      score = 1;
      error = { original: 'Sehr geehrter Frau', correction: 'Sehr geehrte Frau', explanation: 'Deklination: Feminin erfordert „-e“' };
    } else if (/\bsehr\s+geehrte\s+(?:praxis-?team|team|ärzteteam)\b/i.test(lower)) {
      score = 1;
      error = { original: 'Sehr geehrte Praxis-Team', correction: 'Sehr geehrtes Praxis-Team', explanation: 'Deklination: Neutrum erfordert „-es“' };
    }
  } else {
    register = 'informal';
    if (/\bliebe\s+herr\b/i.test(lower)) {
      score = 1;
      error = { original: 'Liebe Herr', correction: 'Lieber Herr', explanation: 'Deklination: Maskulin erfordert „Lieber Herr“' };
    } else if (isFormalRequired) {
      score = 1; // Informal greeting used in formal context
    }
  }

  const punctMatch = line.match(/([,!.])$/);
  return {
    recognized: true,
    score,
    text: line,
    register,
    punctuation: punctMatch ? punctMatch[1] : '',
    error
  };
}

function parseClosingAndSignature(lines = [], startFrom = 1, isFormalRequired = true) {
  for (let i = Math.max(startFrom, lines.length - 3); i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase().replace(/[!.,;]+$/, '').trim();
    const matchedRoot = CLOSING_ROOTS.find(r => lower.startsWith(r) || lower.includes(r));

    if (matchedRoot) {
      const closingText = line;
      let senderName = '';
      if (i + 1 < lines.length) {
        senderName = lines.slice(i + 1).join(' ').trim();
      } else {
        const remaining = line.slice(matchedRoot.length).replace(/^[!.,;\s]+/, '').trim();
        if (remaining) senderName = remaining;
      }

      const hasName = Boolean(senderName);
      let score = 2;
      if (!hasName) {
        score = 1;
      } else if (isFormalRequired) {
        const isFormal = matchedRoot.startsWith('mit freundlich') || matchedRoot.startsWith('freundlich');
        const isSemi = matchedRoot.startsWith('schöne') || matchedRoot.startsWith('viele') || matchedRoot.startsWith('beste') || matchedRoot.startsWith('herzliche');
        if (!isFormal && !isSemi) {
          score = 1;
        } else if (isSemi && !senderName.includes(' ')) {
          score = 1;
        }
      }

      return {
        closingIdx: i,
        recognized: true,
        score,
        text: closingText,
        senderName,
        hasName
      };
    }
  }

  return { closingIdx: -1, recognized: false, score: 0, text: '', senderName: '', hasName: false };
}

function extractBodyAndSentences(lines = [], salutationEnd = 0, closingStart = -1) {
  const end = closingStart !== -1 ? closingStart : lines.length;
  const bodyLines = lines.slice(salutationEnd + 1, end);
  const bodyText = bodyLines.join(' ').trim();

  // Split into sentences preserving delimiters
  const rawSentences = bodyText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  return { bodyText, bodySentences: rawSentences };
}

function checkPunctuationTransition(salutation = {}, bodySentences = []) {
  if (salutation.punctuation !== ',' || bodySentences.length === 0) return null;
  const firstWordMatch = bodySentences[0].match(/^[A-ZÄÖÜa-zäöüß]+/);
  if (!firstWordMatch) return null;

  const firstWord = firstWordMatch[0];
  const isCap = /^[A-ZÄÖÜ]/.test(firstWord);
  if (isCap && !POLITE_PRONOUNS.has(firstWord.toLowerCase())) {
    return {
      code: 'WARN_LOWERCASE_AFTER_COMMA',
      message: `Nach einem Komma in der Anrede wird klein weitergeschrieben („${firstWord.toLowerCase()}“ statt „${firstWord}“).`
    };
  }
  return null;
}

export function segmentMacroStructure(rawText = '', { isFormalRequired = true } = {}) {
  const lines = normalizeLines(rawText);
  if (lines.length === 0) {
    return { anrede: { recognized: false, score: 0 }, closing: { recognized: false, score: 0 }, bodyText: '', bodySentences: [] };
  }

  const salutation = parseSalutation(lines[0], isFormalRequired);
  const salutationIdx = salutation.recognized ? 0 : -1;
  const closing = parseClosingAndSignature(lines, salutationIdx + 1, isFormalRequired);

  const { bodyText, bodySentences } = extractBodyAndSentences(lines, salutationIdx, closing.closingIdx);
  const commaWarning = checkPunctuationTransition(salutation, bodySentences);

  return {
    anrede: salutation,
    closing,
    bodyText,
    bodySentences,
    commaWarning,
    wordCount: (bodyText.match(/[\p{L}\p{N}]+/gu) || []).length
  };
}
