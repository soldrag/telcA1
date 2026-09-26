// Noun capitalisation is the grammar engine's letter rule (nounCapitalization, from the level lexicon);
// this analyzer only rates length and repetition.

function checkRepetitionAndGibberish(words = []) {
  if (words.length === 0) return { isGibberish: true, reason: 'Kein Text' };
  if (words.length < 5) return { isGibberish: false, reason: null };

  const wordCounts = {};
  for (const w of words) {
    const lower = w.toLowerCase();
    wordCounts[lower] = (wordCounts[lower] || 0) + 1;
  }

  const uniqueWords = Object.keys(wordCounts).length;
  const uniqueRatio = uniqueWords / words.length;
  const maxRepetition = Math.max(...Object.values(wordCounts));

  if (uniqueRatio < 0.35 || maxRepetition / words.length > 0.4 || (words.length <= 15 && uniqueRatio <= 0.6)) {
    return { isGibberish: true, reason: 'Zu viele Wortwiederholungen oder zusammenhanglose Wörter.' };
  }

  return { isGibberish: false, reason: null };
}

export function analyzeGermanQuality(text = '', targetWords = 30) {
  const rawWords = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = rawWords.length;
  const { isGibberish, reason } = checkRepetitionAndGibberish(rawWords);

  let lengthScore = 2;
  if (wordCount < 15) lengthScore = 0;
  else if (wordCount < 25) lengthScore = 1;

  const feedback = [];
  if (reason) feedback.push(reason);
  if (wordCount < 20) feedback.push(`Textlänge (${wordCount} Wörter) liegt unter der Richtlinie von ca. ${targetWords} Wörtern.`);

  return {
    wordCount,
    lengthScore,
    isGibberish,
    feedback
  };
}
