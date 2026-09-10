const STORAGE_KEY = 'telc_user_id';
const COOKIE_NAME = 'telc_user_id';
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name, value) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

export function getOrCreateUserId() {
  if (typeof window === 'undefined') return 'server_render_user';

  const storedId = localStorage.getItem(STORAGE_KEY) || readCookie(COOKIE_NAME);
  if (storedId && storedId.trim()) {
    writeCookie(COOKIE_NAME, storedId.trim());
    return storedId.trim();
  }

  const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  try {
    localStorage.setItem(STORAGE_KEY, newId);
  } catch {
    // localStorage might be disabled
  }
  writeCookie(COOKIE_NAME, newId);
  return newId;
}

export function getShortUserId(userId) {
  if (!userId || userId === 'anonymous') return 'Гость';
  const clean = userId.replace(/^user-/, '');
  return `#${clean.slice(0, 5)}`;
}

export function resetUserId() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  writeCookie(COOKIE_NAME, '');
  return getOrCreateUserId();
}
