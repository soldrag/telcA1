export function scrollToTop(behavior = 'smooth') {
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior });
  }
}

export function scrollToExamHeader(topOffset = 180, behavior = 'smooth') {
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: topOffset, behavior });
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
