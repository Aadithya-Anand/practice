/**
 * Simple in-memory rate limiter for API routes
 * For production, use Redis or similar
 */

const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const WINDOW_MS = 60_000;
  const MAX_REQUESTS = 30;
  const r = rateLimit(key, MAX_REQUESTS, WINDOW_MS);
  if (r.retryAfter != null) {
    return { allowed: false, retryAfter: Math.ceil(r.retryAfter / 1000) };
  }
  return r;
}

/**
 * Generic rate limit - (key, maxRequests, windowMs)
 * retryAfter is in milliseconds
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfter: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}
