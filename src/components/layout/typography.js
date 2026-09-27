// The type scale of a page. Sizes are rem, so they follow the fluid root size (index.css).

// One h1 per screen: the module on the homes, the page name elsewhere.
export const PAGE_TITLE = 'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-content-primary';

// The line under the page title: what the page holds, in numbers where possible.
export const PAGE_LEAD = 'text-sm sm:text-base text-content-secondary';

// A block title above its frame (see Section): small, quiet, never inside the card.
export const SECTION_TITLE = 'text-sm font-semibold text-content-secondary';

// The title inside a card or a banner: what this card is about.
export const CARD_TITLE = 'text-base lg:text-lg font-bold text-content-primary';

// The title of an exam part (Teil banner) and of a dialog: one step above a card.
export const PART_TITLE = 'text-base sm:text-xl font-bold text-content-primary';
export const DIALOG_TITLE = 'text-lg sm:text-xl font-bold text-content-primary';

// Scores, counts, dates and timers: tabular figures, so digits keep their width and columns of numbers line up.
export const NUMERIC = 'tabular-nums';
