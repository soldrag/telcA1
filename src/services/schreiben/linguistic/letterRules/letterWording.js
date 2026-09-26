/** Shared wording helpers for the letter rules. */
export function matchCapitalization(form, model = '') {
  return /^\p{Lu}/u.test(model) ? form.charAt(0).toUpperCase() + form.slice(1) : form;
}

export const joinWords = (words = []) => words.map((w) => w.word).join(' ');
