import React from 'react';

// frame="card": framed at every width; "desktop": bare on phones, framed from 1024 px; "none": no frame.
const FRAMES = {
  card: 'rounded-2xl bg-surface-card border border-border-default',
  desktop: 'lg:rounded-2xl lg:bg-surface-card lg:border lg:border-border-default',
  none: '',
};
const PADDINGS = {
  card: { normal: 'p-4 lg:p-6', list: 'p-1 lg:p-2', flush: '' },
  desktop: { normal: 'lg:p-6', list: 'lg:p-2', flush: '' },
  none: { normal: '', list: '', flush: '' },
};

export const SECTION_TITLE = 'text-sm font-semibold text-content-secondary';

/**
 * The one block pattern of a page: the title sits above the frame (never inside it), an optional
 * action on the right of the title row, and a body that fills the height its band gives it.
 * titleDesktopOnly: phones read the title (screen readers) but do not see it.
 */
export default function Section({
  id,
  title,
  action = null,
  frame = 'card',
  padding = 'normal',
  titleDesktopOnly = false,
  className = '',
  bodyClassName = '',
  children,
}) {
  return (
    <section aria-labelledby={id} className={`flex flex-col gap-3 min-w-0 ${className}`}>
      <div className={`flex items-center justify-between gap-3 min-h-[1.5rem] ${titleDesktopOnly ? 'max-lg:sr-only' : ''}`}>
        <h2 id={id} className={SECTION_TITLE}>{title}</h2>
        {/* A 44 px touch target that does not make this title row taller than its neighbours'. */}
        {action && <div className="-my-3 flex items-center shrink-0">{action}</div>}
      </div>
      <div className={`flex-1 flex flex-col min-w-0 ${FRAMES[frame]} ${PADDINGS[frame][padding]} ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
