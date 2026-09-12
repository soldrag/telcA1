const GERMAN_MONTHS = {
  januar: '01',
  februar: '02',
  märz: '03',
  maerz: '03',
  april: '04',
  mai: '05',
  juni: '06',
  juli: '07',
  august: '08',
  september: '09',
  oktober: '10',
  november: '11',
  dezember: '12',
};

function padTwoDigits(value) {
  return String(value).padStart(2, '0');
}

function parseNamedMonth(input) {
  const match = input.match(/^(\d{1,2})\.?\s*([a-zäöüß]+)(?:\s*\d{2,4})?$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthName = match[2];
  const monthNumber = GERMAN_MONTHS[monthName];

  if (!monthNumber || day < 1 || day > 31) return null;
  return `${padTwoDigits(day)}.${monthNumber}`;
}

function parseNumericDate(input) {
  const match = input.match(/^(\d{1,2})[./\-](\d{1,2})\.?(?:\s*\d{2,4})?$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  return `${padTwoDigits(day)}.${padTwoDigits(month)}`;
}

export function normalizeGermanDate(str = '') {
  const clean = str.trim().toLowerCase().replace(/[!?,;]/g, '');
  if (!clean) return null;

  return parseNamedMonth(clean) || parseNumericDate(clean);
}

export function areDatesEquivalent(first = '', second = '') {
  const normFirst = normalizeGermanDate(first);
  const normSecond = normalizeGermanDate(second);
  if (!normFirst || !normSecond) return false;
  return normFirst === normSecond;
}
