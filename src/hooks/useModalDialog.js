import { useEffect, useRef } from 'react';

/**
 * Drives a native <dialog> from React state: showModal() gives focus trapping, Esc and inert background.
 * A click on the backdrop (the dialog element itself) closes it.
 */
export function useModalDialog(isOpen, onClose) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) onClose();
  };

  return { dialogRef, handleBackdropClick };
}
