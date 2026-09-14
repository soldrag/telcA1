export function createRateLimiter({
  windowMs = 60 * 1000,
  maxRequests = 120,
  keyGenerator = (req) => req.ip || req.socket?.remoteAddress || 'unknown',
} = {}) {
  const hits = new Map();

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, windowMs);

  if (cleanupTimer.unref) cleanupTimer.unref();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetTime) {
      hits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    record.count += 1;
    next();
  };
}
