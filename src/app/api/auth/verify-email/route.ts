import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Érvénytelen kérés.' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token) {
    return NextResponse.json({ error: 'Hiányzó megerősítő token.' }, { status: 400 });
  }

  const customer = await prisma.customer.findFirst({
    where: { verificationToken: token },
  });

  if (!customer) {
    return NextResponse.json(
      { error: 'Érvénytelen vagy lejárt megerősítő link.' },
      { status: 400 },
    );
  }

  if (customer.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  if (
    !customer.verificationTokenExpires ||
    customer.verificationTokenExpires.getTime() < Date.now()
  ) {
    return NextResponse.json(
      { error: 'A megerősítő link lejárt. Regisztrálj újra vagy kérj új linket.' },
      { status: 400 },
    );
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return NextResponse.json({ ok: true });
}
