// Generic A1 answers written for the smoke test, not taken from the benchmark: the suite checks
// that writing and grading work, not what the grade is.
const FORM_VALUES = ['Anna Keller', '12.05.1995', 'Hauptstraße 7, 10115 Berlin', 'Lehrerin', 'zwei Personen'];
const LETTER = `Liebe Frau Weber,
vielen Dank für Ihre Nachricht. Ich komme gern am Samstag um 10 Uhr.
Kann ich mit dem Bus kommen? Wie viel kostet der Kurs?
Bitte schreiben Sie mir bald.
Viele Grüße
Anna`;

/** Fills every empty text field of the current Schreiben part; returns how many were filled. */
export async function fillVisibleSchreibenFields(page) {
  const fields = page.locator('input[type="text"]:enabled, textarea:enabled').filter({ visible: true });
  const count = await fields.count();
  for (let index = 0; index < count; index += 1) {
    const field = fields.nth(index);
    if (await field.inputValue()) continue;
    const isLetter = (await field.evaluate((element) => element.tagName)) === 'TEXTAREA';
    await field.fill(isLetter ? LETTER : FORM_VALUES[index % FORM_VALUES.length]);
    // Phones hide the bottom bar while the keyboard is open; the user closes it before moving on.
    await field.blur();
  }
  return count;
}
