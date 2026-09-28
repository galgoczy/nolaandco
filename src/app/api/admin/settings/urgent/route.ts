import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { isUrgentEnabled, setUrgentEnabled } from '@/lib/urgentProduction.server';

/** Sürgősségi elkészítés ki-be kapcsolása az adminból. */
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ enabled: await isUrgentEnabled() });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { enabled?: unknown } | null;
  if (typeof body?.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Hiányzó vagy hibás "enabled" érték.' }, { status: 400 });
  }
  await setUrgentEnabled(body.enabled);
  return NextResponse.json({ enabled: body.enabled });
}
