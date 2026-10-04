/** @returns {string} the message of a thrown value, the single text a failure fact carries */
export const describeError = (err) => String(err?.message || err);
