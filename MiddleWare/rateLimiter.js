// middlewares/rateLimiter.js
// Usage: const limiter = createRateLimiter({ windowMs: 10*60*1000, max: 5 });
// app.post('/login', limiter, handler);

function createRateLimiter({ windowMs = 10 * 60 * 1000, max = 5, message }) {
  // store: Map<key, { hits: number, firstSeen: timestamp }>
  const store = new Map();

  return function rateLimiter(req, res, next) {
    try {
      // key can be IP + route to make per-endpoint+ip limitation
      const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
      const route = req.originalUrl || req.url;
      const key = `${ip}:${route}`;

      const now = Date.now();
      const entry = store.get(key);

      if (!entry) {
        store.set(key, { hits: 1, firstSeen: now });
        return next();
      }

      // if window expired, reset
      if (now - entry.firstSeen > windowMs) {
        store.set(key, { hits: 1, firstSeen: now });
        return next();
      }

      // within window
      if (entry.hits >= max) {
        const ttl = Math.ceil((windowMs - (now - entry.firstSeen)) / 1000);
        res.setHeader('Retry-After', String(ttl));
        const msg = message || `Too many requests. Try again in ${ttl} seconds.`;
        return res.status(429).json({ success: false, message: msg });
      }

      entry.hits += 1;
      store.set(key, entry);
      return next();
    } catch (err) {
      // on error fail open (do not block traffic)
      return next();
    }
  };
}

module.exports = createRateLimiter;
