import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/emails/send';
import { passwordResetHtml, passwordResetSubject } from '@/lib/emails/password-reset';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { baseUrl, RESET_TTL_MS } from '@/lib/authUrls';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const ipLimit = rateLimit(`forgot:ip:${ip}`, 5, 15 * 60 * 1000);
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
    // Still return ok to avoid enumeration.
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.toLowerCase().trim();

  const emailLimit = rateLimit(`forgot:email:${email}`, 3, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    return NextResponse.json({ ok: true });
  }

  const customer = await prisma.customer.findUnique({ where: { email } });

  // Do NOT leak whether the email exists or has a password set.
  if (!customer || !customer.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + RESET_TTL_MS);

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordResetToken: token,
      passwordResetTokenExpires: expires,
    },
  });

  const resetUrl = `${baseUrl(req)}/auth/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: passwordResetSubject(),
    html: passwordResetHtml(resetUrl),
  });

  return NextResponse.json({ ok: true });
}
