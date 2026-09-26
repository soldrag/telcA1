import { useEffect, useState } from 'react';
import { getIssuedAssignments, ISSUED_CHANGE_EVENT } from '../services/storage/issuedAssignmentsStorage.js';

/** Issued assignments, re-read when a new link is created or a result comes back. */
export function useIssuedAssignments() {
  const [issued, setIssued] = useState(getIssuedAssignments);

  useEffect(() => {
    const refresh = () => setIssued(getIssuedAssignments());
    window.addEventListener(ISSUED_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(ISSUED_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return issued;
}
