// backend/src/middleware/rateLimiter.js
const rateLimitStore = new Map();

const CLEANUP_INTERVAL = 60 * 1000; // Clean up every minute

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore) {
    if (now - value.firstRequest > value.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

const createRateLimiter = ({ windowMs = 15 * 60 * 1000, maxRequests = 100, message = 'Demasiadas solicitudes, intenta más tarde' } = {}) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}:${req.originalUrl}`;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, firstRequest: now, windowMs });
      return next();
    }

    const entry = rateLimitStore.get(key);

    if (now - entry.firstRequest > windowMs) {
      rateLimitStore.set(key, { count: 1, firstRequest: now, windowMs });
      return next();
    }

    entry.count++;

    if (entry.count > maxRequests) {
      return res.status(429).json({ error: message });
    }

    next();
  };
};

// Pre-configured limiters
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos'
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  message: 'Demasiados intentos de registro. Intenta de nuevo en 1 hora'
});

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'Demasiadas solicitudes a la API. Intenta más tarde'
});

module.exports = { createRateLimiter, loginLimiter, registerLimiter, apiLimiter };
