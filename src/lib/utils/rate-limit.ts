// src/lib/utils/rate-limit.ts

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Basic rate limit checker for actions
 * @param key unique identifier (e.g. visitorId + action)
 * @param maxRequests maximum allowed within window
 * @param windowMs window in milliseconds (e.g. 60000 for 1 minute)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}
