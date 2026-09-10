const USER_ID_HEADER = 'x-user-id';
const COOKIE_NAME = 'telc_user_id';
const ANONYMOUS_USER_ID = 'anonymous';

function parseCookieHeader(cookieHeader = '') {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map(entry => entry.trim().split('='))
      .filter(([key, val]) => Boolean(key) && Boolean(val))
  );
}

export function extractUserId(req) {
  if (!req) return ANONYMOUS_USER_ID;

  const headerValue = req.headers?.[USER_ID_HEADER];
  if (typeof headerValue === 'string' && headerValue.trim()) {
    return headerValue.trim();
  }

  const cookieHeader = req.headers?.cookie || '';
  const cookies = parseCookieHeader(cookieHeader);
  if (cookies[COOKIE_NAME]) {
    return cookies[COOKIE_NAME].trim();
  }

  return ANONYMOUS_USER_ID;
}
