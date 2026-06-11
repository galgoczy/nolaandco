import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendEmail } from '@/lib/emails/send';
import { verificationEmailHtml, verificationEmailSubject } from '@/lib/emails/verification';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { baseUrl, VERIFY_TTL_MS } from '@/lib/authUrls';

const schema = z.object({
  email: z.string().email('Érvényes e-mail cím szükséges'),
  password: z.string().min(8, 'A jelszónak legalább 8 karakterből kell állnia'),
  name: z.string().min(2, 'Név megadása kötelező').max(80),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const ipLimit = rateLimit(`register:ip:${ip}`, 5, 15 * 60 * 1000);
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

  const email = parsed.data.email.toLowerCase().trim();
  const { password, name } = parsed.data;

  const emailLimit = rateLimit(`register:email:${email}`, 3, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: 'Erre az e-mail címre már küldtünk megerősítő levelet. Várj legalább egy órát az újabb próbálkozás előtt.' },
      { status: 429 },
    );
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (admin) {
    return NextResponse.json(
      { error: 'Ez az e-mail cím már foglalt.' },
      { status: 409 },
    );
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing?.emailVerified && existing.passwordHash) {
    return NextResponse.json(
      { error: 'Ez az e-mail cím már regisztrálva van. Kérjük, jelentkezz be.' },
      { status: 409 },
    );
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + VERIFY_TTL_MS);
  const passwordHash = hashPassword(password);

  await prisma.customer.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      emailVerified: false,
      verificationToken: token,
      verificationTokenExpires: expires,
    },
    update: {
      name,
      passwordHash,
      emailVerified: false,
      verificationToken: token,
      verificationTokenExpires: expires,
    },
  });

  const verifyUrl = `${baseUrl(req)}/auth/verify?token=${token}`;
  await sendEmail({
    to: email,
    subject: verificationEmailSubject(),
    html: verificationEmailHtml(verifyUrl),
  });

  return NextResponse.json({ ok: true });
}
