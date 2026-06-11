/**
 * Best-effort in-memory rate limiter.
 *
 * On serverless platforms each lambda instance holds its own map, so this is
 * only a soft defense against casual abuse — not a replacement for a shared
 * store like Redis. Good enough for a small shop with low RPS.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
};

export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0, remaining: max - 1 };
  }
  if (b.count >= max) {
    return { allowed: false, retryAfterMs: b.resetAt - now, remaining: 0 };
  }
  b.count += 1;
  return { allowed: true, retryAfterMs: 0, remaining: max - b.count };
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
