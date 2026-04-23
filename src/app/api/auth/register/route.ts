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

  // Uniform response regardless of whether the email is admin, existing
  // customer (verified or not), or new. Prevents email enumeration and
  // account-hijack attempts via register (see C-3 in the security audit).
  const uniformResponse = NextResponse.json({ ok: true });

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (admin) return uniformResponse;

  const existing = await prisma.customer.findUnique({ where: { email } });
  // If a customer already exists (verified, or Google-linked without
  // password), do NOT overwrite their record from this path — quietly
  // succeed. A legit user in this state should use "forgot password".
  if (existing) return uniformResponse;

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + VERIFY_TTL_MS);
  const passwordHash = hashPassword(password);

  await prisma.customer.create({
    data: {
      email,
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

  return uniformResponse;
}
