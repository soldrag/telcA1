import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'telc_welcome_role';
const CHANGE_EVENT = 'telc-welcome-role-change';
const ROLES = new Set(['student', 'teacher']);

function readStoredRole() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return ROLES.has(stored) ? stored : 'student';
  } catch {
    return 'student';
  }
}

// The role switch lives in the header while the home screen renders the view: both stay in sync via a window event.
export function useWelcomeRole() {
  const [activeRole, setRole] = useState(readStoredRole);

  useEffect(() => {
    const syncRole = (event) => setRole(event.detail);
    window.addEventListener(CHANGE_EVENT, syncRole);
    return () => window.removeEventListener(CHANGE_EVENT, syncRole);
  }, []);

  const selectRole = useCallback((role) => {
    if (!ROLES.has(role)) return;
    try { localStorage.setItem(STORAGE_KEY, role); } catch { /* private mode: keep in memory */ }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: role }));
  }, []);

  return { activeRole, selectRole };
}
