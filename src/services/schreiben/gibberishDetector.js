// A letter made of a few words repeated over and over carries no message. Noun capitalisation is the
// grammar engine's letter rule (nounCapitalization, from the level lexicon), not this detector's.

function countWords(words) {
  const counts = new Map();
  for (const word of words) counts.set(word.toLowerCase(), (counts.get(word.toLowerCase()) || 0) + 1);
  return counts;
}

/** @returns {boolean} true for an empty text or one dominated by repetitions */
export function isGibberishText(text = '') {
  const words = text.trim() ? text.trim().split(/\s+/) : [];
  if (words.length === 0) return true;
  if (words.length < 5) return false;
  const counts = countWords(words);
  const uniqueRatio = counts.size / words.length;
  const maxRepetition = Math.max(...counts.values());
  return uniqueRatio < 0.35 || maxRepetition / words.length > 0.4 || (words.length <= 15 && uniqueRatio <= 0.6);
}
