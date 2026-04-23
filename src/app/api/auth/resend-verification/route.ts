import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/emails/send';
import { verificationEmailHtml, verificationEmailSubject } from '@/lib/emails/verification';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { baseUrl, VERIFY_TTL_MS } from '@/lib/authUrls';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const ipLimit = await rateLimit(`resend:ip:${ip}`, 5, 15 * 60 * 1000);
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
    return NextResponse.json({ error: 'Érvénytelen e-mail cím.' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  const emailLimit = await rateLimit(`resend:email:${email}`, 3, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    // Deliberately return ok to avoid enumeration + throttle silently.
    return NextResponse.json({ ok: true });
  }

  const customer = await prisma.customer.findUnique({ where: { email } });

  // No-op silent response if:
  //   - the account does not exist,
  //   - it's already verified,
  //   - it has no password (Google-only account).
  // All return the same shape to prevent enumeration.
  if (!customer || customer.emailVerified || !customer.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + VERIFY_TTL_MS);

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
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
