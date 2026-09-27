import React from 'react';
import { BAND, BAND_TOP } from './pageLayout.js';

/**
 * A desktop row of the page grid (see pageLayout.js). align="stretch": the blocks share the top and
 * the bottom edge; "start": top-aligned, for a sticky column beside a long one.
 * data-band lets the grid alignment test (tests/ui/layout.spec.js) find every row.
 */
export default function Band({ align = 'stretch', className = '', children }) {
  return (
    <div data-band={align} className={`${align === 'start' ? BAND_TOP : BAND} ${className}`}>
      {children}
    </div>
  );
}
