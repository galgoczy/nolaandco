import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { scanStorage, deleteOrphans } from '@/lib/blobStorage.server';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** GET: tárhely-jelentés. POST { urls }: a megadott árva fájlok törlése. */
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Nincs BLOB_READ_WRITE_TOKEN.' }, { status: 500 });
  }
  try {
    return NextResponse.json(await scanStorage());
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { urls?: string[] } | null;
  const urls = Array.isArray(body?.urls) ? body!.urls.filter((u) => typeof u === 'string') : [];
  if (urls.length === 0) return NextResponse.json({ error: 'Nincs mit törölni.' }, { status: 400 });
  try {
    return NextResponse.json(await deleteOrphans(urls));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
