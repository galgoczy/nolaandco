import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

function requireAdminSecret(): string {
  const value = process.env.ADMIN_SECRET;
  if (!value) {
    throw new Error(
      'ADMIN_SECRET env var is not set. Admin tokens and password hashes cannot be generated safely without it.',
    );
  }
  return value;
}
const ADMIN_SECRET = requireAdminSecret();

// Cost factor tuned for Vercel serverless: ~200ms per hash/verify. Raise
// cautiously — lambda cold starts already eat into auth latency.
const BCRYPT_ROUNDS = 12;

// bcrypt hashes always start with $2a$, $2b$, $2x$ or $2y$. We use that
// prefix to tell a new-style hash apart from the legacy SHA-256 hex hash.
function isBcryptHash(hash: string): boolean {
  return /^\$2[abxy]\$/.test(hash);
}

/**
 * Hash a password with bcrypt. Only used for NEW hashes (registration,
 * password reset, successful lazy migration). Async — callers must await.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Legacy SHA-256(password + ADMIN_SECRET) — kept ONLY to verify pre-existing
 * hashes so we can lazy-migrate them to bcrypt on successful login. Never
 * call this to produce a new hash.
 */
function legacyShaHash(password: string): string {
  return crypto.createHash('sha256').update(password + ADMIN_SECRET).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  // timingSafeEqual requires equal-length buffers; short-circuit length
  // mismatch with a dummy compare to keep timing roughly constant.
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export type VerifyResult = {
  /** Password matched the stored hash. */
  valid: boolean;
  /** True when the stored hash is legacy SHA-256 and should be re-hashed
   *  with bcrypt. Callers should replace the DB column with the value from
   *  `upgradedHash` on a successful legacy verify. */
  needsUpgrade: boolean;
  /** New bcrypt hash ready to persist when needsUpgrade is true. */
  upgradedHash?: string;
};

/**
 * Verify a plain password against a stored hash. Accepts both bcrypt hashes
 * (new) and legacy SHA-256 hex hashes (migration window). When the legacy
 * format matches, returns a fresh bcrypt hash in `upgradedHash` so the caller
 * can transparently migrate the row on login.
 */
export async function verifyPassword(password: string, hash: string): Promise<VerifyResult> {
  if (isBcryptHash(hash)) {
    const valid = await bcrypt.compare(password, hash);
    return { valid, needsUpgrade: false };
  }
  // Legacy SHA-256 path — plan to delete once usage drops to zero.
  const legacyMatch = safeEqualHex(legacyShaHash(password), hash);
  if (!legacyMatch) {
    return { valid: false, needsUpgrade: false };
  }
  const upgradedHash = await hashPassword(password);
  return { valid: true, needsUpgrade: true, upgradedHash };
}

export function createToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + hmac;
}

export function verifyToken(token: string): { email: string } | null {
  try {
    const [payloadB64, hmac] = token.split('.');
    if (!payloadB64 || !hmac) return null;
    const payload = Buffer.from(payloadB64, 'base64').toString();
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
    if (!safeEqualHex(hmac, expected)) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
