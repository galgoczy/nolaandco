import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

const ALLOWED_LAYOUT_IDS = ['origin-1', 'origin-2', 'origin-3', 'nova-1', 'nova-2', 'nova-3'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const bool = (v: unknown) => Boolean(v);
  const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);

  const patch: Record<string, unknown> = {};
  if (typeof data.name === 'string') patch.name = str(data.name);
  if (typeof data.imageUrl === 'string') patch.imageUrl = str(data.imageUrl);
  if ('badge' in data) patch.badge = str(data.badge) || null;
  if (typeof data.defaultLayoutId === 'string') {
    const v = str(data.defaultLayoutId);
    if (!ALLOWED_LAYOUT_IDS.includes(v)) {
      return NextResponse.json({ error: 'Érvénytelen layout azonosító' }, { status: 400 });
    }
    patch.defaultLayoutId = v;
  }
  if ('active' in data) patch.active = bool(data.active);
  if ('sortOrder' in data) patch.sortOrder = num(data.sortOrder);

  try {
    const alias = await prisma.productAlias.update({ where: { id }, data: patch });
    return NextResponse.json({ alias });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Mentés sikertelen';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
