export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
export const RESET_TTL_MS = 60 * 60 * 1000;

export function baseUrl(req: Request): string {
  const envUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}
