import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'A jelszónak legalább 8 karakterből kell állnia'),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const ipLimit = rateLimit(`reset:ip:${ip}`, 10, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: 'Túl sok próbálkozás. Kérjük, várj néhány percet.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Érvénytelen kérés.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Érvénytelen adatok.' },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;

  const customer = await prisma.customer.findFirst({
    where: { passwordResetToken: token },
  });

  if (
    !customer ||
    !customer.passwordResetTokenExpires ||
    customer.passwordResetTokenExpires.getTime() < Date.now()
  ) {
    return NextResponse.json(
      { error: 'A jelszó visszaállító link érvénytelen vagy lejárt.' },
      { status: 400 },
    );
  }

  const newHash = await hashPassword(password);
  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash: newHash,
      passwordResetToken: null,
      passwordResetTokenExpires: null,
      // Access to the reset email implies email ownership, so mark verified.
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return NextResponse.json({ ok: true });
}
