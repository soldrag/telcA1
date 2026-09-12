const STORAGE_KEY = 'telc_user_id';
const COOKIE_NAME = 'telc_user_id';

function purgeLegacyCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

function safeGetStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function generateRandomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getOrCreateUserId() {
  if (typeof window === 'undefined') return 'server_render_user';

  purgeLegacyCookie();

  const storedId = safeGetStorage(STORAGE_KEY);
  if (storedId && storedId.trim()) {
    return storedId.trim();
  }

  const generatedUserId = generateRandomId();
  safeSetStorage(STORAGE_KEY, generatedUserId);
  return generatedUserId;
}

export function getShortUserId(userId) {
  if (!userId || userId === 'anonymous') return '#guest';
  const cleanId = userId.replace(/^user-/, '');
  return `#${cleanId.slice(0, 5)}`;
}

export function resetUserId() {
  if (typeof window === 'undefined') return;
  safeRemoveStorage(STORAGE_KEY);
  purgeLegacyCookie();
}
