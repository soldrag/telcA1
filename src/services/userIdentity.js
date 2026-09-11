const STORAGE_KEY = 'telc_user_id';
const COOKIE_NAME = 'telc_user_id';
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

function readCookie(cookieName) {
  if (typeof document === 'undefined') return null;
  const cookieMatch = document.cookie.match(new RegExp('(^|;\\s*)(' + cookieName + ')=([^;]*)'));
  return cookieMatch ? decodeURIComponent(cookieMatch[3]) : null;
}

function writeCookie(cookieName, cookieValue) {
  if (typeof document === 'undefined') return;
  document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (storageError) {
    return false;
  }
  return true;
}

function safeRemoveStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (storageError) {
    return false;
  }
  return true;
}

export function getOrCreateUserId() {
  if (typeof window === 'undefined') return 'server_render_user';

  const storedId = localStorage.getItem(STORAGE_KEY) || readCookie(COOKIE_NAME);
  if (storedId && storedId.trim()) {
    writeCookie(COOKIE_NAME, storedId.trim());
    return storedId.trim();
  }

  const generatedUserId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  safeSetStorage(STORAGE_KEY, generatedUserId);
  writeCookie(COOKIE_NAME, generatedUserId);
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
  writeCookie(COOKIE_NAME, '');
}
