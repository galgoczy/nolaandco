import { cookies } from 'next/headers';
import crypto from 'crypto';

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

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + ADMIN_SECRET).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  // timingSafeEqual requires equal-length buffers; short-circuit length
  // mismatch with a dummy compare to keep timing roughly constant.
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) {
    // Still do a compare to avoid early-return timing leak.
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function verifyPassword(password: string, hash: string): boolean {
  return safeEqualHex(hashPassword(password), hash);
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
