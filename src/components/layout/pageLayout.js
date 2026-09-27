// One container for the header, the page and the bars: 75rem (1200 px at the base size; it grows
// with the root font size on large monitors, see index.css).
export const PAGE_CONTAINER = 'mx-auto w-full max-w-[75rem] px-4 sm:px-6 lg:px-10';

// Portrait tablets read one wide column (max 720 px) instead of a stretched desktop layout.
export const SCREEN_COLUMN = 'mx-auto w-full sm:max-w-[45rem] lg:max-w-none';

// The vertical rhythm of a page built from bands: 32 px between blocks on phones, 40 px between bands on desktop.
export const PAGE_STACK = 'flex flex-col gap-8 lg:gap-10';

// A desktop row of the 12-column page grid. Its blocks stretch to one height, so neighbours share
// the top and the bottom edge. Below 1024 px it dissolves (display: contents) and the blocks join
// the page stream in the order their `order-*` classes give.
export const BAND = 'contents lg:grid lg:grid-cols-12 lg:gap-x-6 lg:items-stretch';

// A band whose blocks keep their own height, top-aligned: for a sticky column beside a long one.
export const BAND_TOP = 'contents lg:grid lg:grid-cols-12 lg:gap-x-6 lg:items-start';

// How many of the 12 columns a block takes inside a band.
export const SPAN = {
  main: 'lg:col-span-8',
  side: 'lg:col-span-4',
  wide: 'lg:col-span-7',
  narrow: 'lg:col-span-5',
  half: 'lg:col-span-6',
  full: 'lg:col-span-12',
};
