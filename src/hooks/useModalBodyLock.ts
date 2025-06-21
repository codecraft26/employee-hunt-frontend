import { useEffect } from 'react';

/**
 * A custom hook to lock and unlock the body scroll when a modal is open,
 * preventing the background from scrolling and avoiding layout shift.
 *
 * @param isOpen - A boolean indicating whether the modal is currently open.
 */
export const useModalBodyLock = (isOpen: boolean): void => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const body = document.body;

    if (isOpen) {
      const scrollbarWidth = window.innerWidth - body.clientWidth;
      body.style.paddingRight = `${scrollbarWidth}px`;
      body.classList.add('modal-open');
    } else {
      // Only remove the style if the class is present
      if (body.classList.contains('modal-open')) {
        body.classList.remove('modal-open');
        body.style.paddingRight = '';
      }
    }

    // Cleanup function to ensure the body is unlocked when the component unmounts
    return () => {
      if (body.classList.contains('modal-open')) {
        body.classList.remove('modal-open');
        body.style.paddingRight = '';
      }
    };
  }, [isOpen]);
}; 