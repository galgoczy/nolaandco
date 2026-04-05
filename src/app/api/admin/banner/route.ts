import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET() {
  // Public: anyone can read the active banner (the Navbar reads it at runtime).
  const now = new Date();
  const banner = await prisma.banner.findFirst({
    where: {
      active: true,
      OR: [{ endsAt: null }, { endsAt: { gte: now } }],
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ banner });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }

  const d = body as Record<string, unknown>;
  const text = typeof d.text === 'string' ? d.text.trim() : '';
  if (!text) return NextResponse.json({ error: 'Szöveg kötelező' }, { status: 400 });

  const banner = await prisma.banner.create({
    data: {
      text,
      textColor: typeof d.textColor === 'string' ? d.textColor : '#FFFFFF',
      bgColor: typeof d.bgColor === 'string' ? d.bgColor : '#4A4A4A',
      href: typeof d.href === 'string' && d.href.trim() ? d.href.trim() : null,
      active: d.active !== false,
      endsAt: typeof d.endsAt === 'string' && d.endsAt ? new Date(d.endsAt) : null,
    },
  });
  return NextResponse.json({ banner });
}

export async function PATCH(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }

  const d = body as Record<string, unknown>;
  if (typeof d.id !== 'string') {
    return NextResponse.json({ error: 'id szükséges' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof d.text === 'string') update.text = d.text.trim();
  if (typeof d.textColor === 'string') update.textColor = d.textColor;
  if (typeof d.bgColor === 'string') update.bgColor = d.bgColor;
  if (d.href !== undefined) update.href = typeof d.href === 'string' && d.href.trim() ? d.href.trim() : null;
  if (typeof d.active === 'boolean') update.active = d.active;
  if (d.endsAt !== undefined) update.endsAt = typeof d.endsAt === 'string' && d.endsAt ? new Date(d.endsAt) : null;

  const banner = await prisma.banner.update({ where: { id: d.id }, data: update });
  return NextResponse.json({ banner });
}
