type Bucket = {
  count: number;
  firstAt: number;
};

const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 60_000;

export function rateLimit(
  key: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS,
) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.firstAt > windowMs) {
    buckets.set(key, { count: 1, firstAt: now });
    return { allowed: true as const };
  }

  if (existing.count >= limit) {
    const retryAfter = windowMs - (now - existing.firstAt);
    return { allowed: false as const, retryAfter };
  }

  existing.count += 1;
  return { allowed: true as const };
}

