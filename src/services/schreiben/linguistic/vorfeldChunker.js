/**
 * Vorfeld constituent chunker for German sentences.
 * Chunks Noun Phrases (NP), Prepositional Phrases (PP), and Adverbs into discrete constituents.
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

function isNounLike(token = {}) {
  if (token.pos === 'NOUN' || token.isProperName) return true;
  if (token.pos && token.pos !== 'UNKNOWN') return false;
  return /^[A-ZÄÖÜ]/.test(token.raw || '');
}

function chunkNounPhrase(tokens = [], startIndex = 0) {
  let i = startIndex;
  while (i < tokens.length && (tokens[i].pos === 'DET' || tokens[i].pos === 'ADJ')) {
    i++;
  }
  if (i < tokens.length && isNounLike(tokens[i])) {
    i++;
    // Absorb consecutive nouns/titles: "Herr" + "Dr." + "Schneider"
    while (i < tokens.length && isNounLike(tokens[i])) {
      i++;
    }
    const chunkTokens = tokens.slice(startIndex, i);
    return {
      constituent: {
        type: 'NP',
        tokens: chunkTokens,
        rawText: chunkTokens.map(t => t.raw).join(' ')
      },
      nextIndex: i
    };
  }
  return null;
}

function chunkPrepositionalPhrase(tokens = [], startIndex = 0) {
  let i = startIndex + 1; // skip prep
  while (i < tokens.length && (tokens[i].pos === 'DET' || tokens[i].pos === 'ADJ')) {
    i++;
  }
  const isOrdinalDate = /^\d{1,2}\.$/.test(tokens[i]?.raw || '');
  if (i < tokens.length && (isNounLike(tokens[i]) || /^\d+$/.test(tokens[i].raw || '') || isOrdinalDate)) {
    i++;
    // "am 3. Mai", "für 5000 Euro": a number and the noun it counts are one phrase
    if ((isOrdinalDate || /^\d+$/.test(tokens[i - 1].raw || '')) && i < tokens.length && isNounLike(tokens[i])) i++;
    if (i < tokens.length && tokens[i].raw.toLowerCase() === 'uhr') {
      i++;
    }
    const chunkTokens = tokens.slice(startIndex, i);
    return {
      constituent: {
        type: 'PP',
        tokens: chunkTokens,
        rawText: chunkTokens.map(t => t.raw).join(' ')
      },
      nextIndex: i
    };
  }
  return null;
}

function mergeStackedTemporalPPs(constituents = []) {
  if (constituents.length <= 1) return constituents;
  const merged = [];
  let i = 0;

  while (i < constituents.length) {
    const curr = constituents[i];
    const next = constituents[i + 1];

    if (curr.type === 'PP' && next && next.type === 'PP') {
      const combinedText = `${curr.rawText} ${next.rawText}`;
      if (/^(am|im|um|ab)\b/i.test(curr.rawText) && /^(am|im|um)\b/i.test(next.rawText)) {
        merged.push({
          type: 'PP',
          tokens: [...curr.tokens, ...next.tokens],
          rawText: combinedText,
          isTemporalComplex: true
        });
        i += 2;
        continue;
      }
    }
    merged.push(curr);
    i++;
  }
  return merged;
}

/** A PP right after a noun phrase is its attribute: "das Wetter in Berlin" is one constituent. */
function mergePostnominalPPs(constituents = []) {
  return constituents.reduce((merged, curr) => {
    const prev = merged[merged.length - 1];
    if (prev?.type === 'NP' && curr.type === 'PP') {
      merged[merged.length - 1] = { ...prev, tokens: [...prev.tokens, ...curr.tokens], rawText: `${prev.rawText} ${curr.rawText}` };
      return merged;
    }
    return [...merged, curr];
  }, []);
}

export function estimateVorfeldConstituents(tokens = []) {
  const constituents = [];
  let i = 0;

  while (i < tokens.length) {
    const t = tokens[i];

    if (t.pos === 'PRON_SUBJ') {
      constituents.push({ type: 'SUBJECT_PRON', tokens: [t], rawText: t.raw });
      i++;
      continue;
    }

    if (t.lower === 'wie' && tokens[i + 1] && /^(viel|viele|lange|oft|weit|spät)$/i.test(tokens[i + 1].lower)) {
      const chunkTokens = [t, tokens[i + 1]];
      constituents.push({ type: 'W_WORD', tokens: chunkTokens, rawText: `${t.raw} ${tokens[i + 1].raw}` });
      i += 2;
      continue;
    }

    if (t.pos === 'DET' || t.pos === 'ADJ' || isNounLike(t)) {
      const npChunk = chunkNounPhrase(tokens, i);
      if (npChunk) {
        constituents.push(npChunk.constituent);
        i = npChunk.nextIndex;
        continue;
      }
    }

    if (t.pos === 'PREP') {
      const ppChunk = chunkPrepositionalPhrase(tokens, i);
      if (ppChunk) {
        constituents.push(ppChunk.constituent);
        i = ppChunk.nextIndex;
        continue;
      }
    }

    if (t.pos === 'INTERROG') {
      // An interrogative determiner and its noun phrase are one constituent: "Welche Bücher", "Welchen Kurs".
      const np = chunkNounPhrase(tokens, i + 1);
      const chunkTokens = np && /^welch/i.test(t.lower || '') ? [t, ...np.constituent.tokens] : [t];
      constituents.push({ type: 'W_WORD', tokens: chunkTokens, rawText: chunkTokens.map((c) => c.raw).join(' ') });
      i += chunkTokens.length;
      continue;
    }

    if (t.pos === 'ADV') {
      constituents.push({ type: 'ADVP', tokens: [t], rawText: t.raw });
      i++;
      continue;
    }

    constituents.push({ type: 'UNKNOWN', tokens: [t], rawText: t.raw });
    i++;
  }

  return mergePostnominalPPs(mergeStackedTemporalPPs(constituents));
}
