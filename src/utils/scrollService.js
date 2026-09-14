export function scrollToTop(behavior = 'auto') {
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, left: 0, behavior });
  } else if (typeof document !== 'undefined') {
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }
}

export function scrollToExamHeader(topOffset = 0, behavior = 'auto') {
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: topOffset, left: 0, behavior });
  }
}

export function scrollToElement(elementId, options = { behavior: 'smooth', block: 'center' }) {
  if (typeof document === 'undefined') return;
  const targetElement = document.getElementById(elementId);
  if (targetElement && typeof targetElement.scrollIntoView === 'function') {
    targetElement.scrollIntoView(options);
  }
}

export function lockBodyScroll() {
  if (typeof document !== 'undefined' && document.body) {
    document.body.style.overflow = 'hidden';
  }
}

export function unlockBodyScroll() {
  if (typeof document !== 'undefined' && document.body) {
    document.body.style.overflow = '';
  }
}
