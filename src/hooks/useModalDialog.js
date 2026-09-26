import { useEffect, useRef } from 'react';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scrollService.js';

/**
 * Drives a native <dialog> from React state: showModal() gives focus trapping, Esc and inert background.
 * Focus goes back to the element that opened it; a click on the backdrop (the dialog element itself) closes it.
 */
export function useModalDialog(isOpen, onClose) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return undefined;
    const opener = document.activeElement;
    if (!dialog.open) dialog.showModal();
    lockBodyScroll();
    return () => {
      if (dialog.open) dialog.close();
      unlockBodyScroll();
      if (opener?.isConnected) opener.focus?.();
    };
  }, [isOpen]);

  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) onClose?.();
  };

  // Esc: React state decides; a dialog without onClose (time is up) cannot be dismissed.
  const handleCancel = (event) => {
    event.preventDefault();
    onClose?.();
  };

  return { dialogRef, handleBackdropClick, handleCancel };
}
