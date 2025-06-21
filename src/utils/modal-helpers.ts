/**
 * Manages the body's 'modal-open' class and padding to prevent layout shift
 * when modals are opened or closed.
 */
export const manageModalBodyLock = (isOpen: boolean): void => {
  if (typeof window === 'undefined') return;

  const body = document.body;
  const scrollbarWidth = window.innerWidth - body.clientWidth;

  if (isOpen) {
    body.style.paddingRight = `${scrollbarWidth}px`;
    body.classList.add('modal-open');
  } else {
    // We only remove the style if the class is present, to avoid issues
    // if this function is called multiple times for closing.
    if (body.classList.contains('modal-open')) {
      body.classList.remove('modal-open');
      body.style.paddingRight = '';
    }
  }
}; 