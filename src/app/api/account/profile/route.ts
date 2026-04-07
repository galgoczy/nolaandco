import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ customer: null });
  }

  const customer = await prisma.customer.findUnique({
    where: { email: session.user.email },
  });

  return NextResponse.json({ customer });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }

  const {
    name,
    phone,
    shippingName,
    shippingZip,
    shippingCity,
    shippingAddress,
    shippingNote,
    newsletter,
  } = body as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() || null : null);

  const customer = await prisma.customer.upsert({
    where: { email: session.user.email },
    create: {
      email: session.user.email,
      name: str(name),
      phone: str(phone),
      shippingName: str(shippingName),
      shippingZip: str(shippingZip),
      shippingCity: str(shippingCity),
      shippingAddress: str(shippingAddress),
      shippingNote: str(shippingNote),
      newsletter: Boolean(newsletter),
    },
    update: {
      name: str(name),
      phone: str(phone),
      shippingName: str(shippingName),
      shippingZip: str(shippingZip),
      shippingCity: str(shippingCity),
      shippingAddress: str(shippingAddress),
      shippingNote: str(shippingNote),
      newsletter: Boolean(newsletter),
    },
  });

  return NextResponse.json({ ok: true, customer });
}
