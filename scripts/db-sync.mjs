import { execSync } from 'node:child_process';

// Sync Prisma schema to the database during Vercel builds only.
// Local `npm run build` stays read-only — devs run `npm run db:push` manually.
// Intentionally NOT using --accept-data-loss: fail loudly if a column removal
// or type change would drop data, so the deploy blocks instead of silently losing rows.

if (!process.env.VERCEL) {
  console.log('[db-sync] Not a Vercel build — skipping prisma db push.');
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.log('[db-sync] DATABASE_URL not set — skipping prisma db push.');
  process.exit(0);
}

console.log('[db-sync] Running prisma db push (skip-generate)...');
execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
console.log('[db-sync] Schema synced.');
