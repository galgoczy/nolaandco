/**
 * Rate limiter with two backends:
 *
 * 1. Upstash Redis (shared across Vercel lambdas) when UPSTASH_REDIS_REST_URL
 *    + UPSTASH_REDIS_REST_TOKEN are set. This is the production backend.
 * 2. In-memory Map fallback (per-lambda) for local dev or misconfigured env.
 *    Same behaviour as before — only meaningful for single-process use.
 *
 * The interface is async because Upstash is an HTTP call. Callers must
 * `await rateLimit(...)`.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
};

// ── Upstash setup ──────────────────────────────────────────────────────────

type UpstashEnv = {
  url: string;
  token: string;
};

function resolveUpstashEnv(): UpstashEnv | null {
  // Prefer Upstash-branded vars; Vercel KV exposes the same values under KV_*.
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? undefined;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? undefined;
  if (!url || !token) return null;
  return { url, token };
}

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const env = resolveUpstashEnv();
  if (!env) return null;
  redis = new Redis({ url: env.url, token: env.token });
  return redis;
}

// Ratelimit instances are keyed by "<max>:<windowMs>" so we reuse them.
const upstashCache = new Map<string, Ratelimit>();
function getUpstashLimiter(max: number, windowMs: number): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  const key = `${max}:${windowMs}`;
  let limiter = upstashCache.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.fixedWindow(max, `${windowMs} ms`),
      analytics: false,
      prefix: 'nola:rl',
    });
    upstashCache.set(key, limiter);
  }
  return limiter;
}

// ── In-memory fallback ─────────────────────────────────────────────────────

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function memoryRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
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

// ── Public API ─────────────────────────────────────────────────────────────

export async function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(max, windowMs);
  if (limiter) {
    try {
      const result = await limiter.limit(key);
      return {
        allowed: result.success,
        remaining: Math.max(0, result.remaining),
        retryAfterMs: Math.max(0, result.reset - Date.now()),
      };
    } catch (err) {
      // Upstash outage: fall back to in-memory for this request so we
      // degrade gracefully instead of hard-failing every limited route.
      console.error('Upstash rate-limit error, falling back to in-memory:', err);
      return memoryRateLimit(key, max, windowMs);
    }
  }
  return memoryRateLimit(key, max, windowMs);
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
