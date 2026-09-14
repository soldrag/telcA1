export function createDebugAuthMiddleware({
  nodeEnv = process.env.NODE_ENV,
  adminKey = process.env.DEBUG_ADMIN_KEY,
} = {}) {
  return (req, res, next) => {
    const isProduction = nodeEnv === 'production';

    if (isProduction && !adminKey) {
      return res.status(403).json({ error: 'Debug API disabled in production' });
    }

    if (adminKey) {
      const providedKey = req.headers['x-debug-key'];
      if (providedKey !== adminKey) {
        return res.status(401).json({ error: 'Unauthorized debug access' });
      }
    }

    next();
  };
}
