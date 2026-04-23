import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newsletterSchema } from '@/lib/validators';
import { mailerliteSubscribe } from '@/lib/mailerlite';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const ipLimit = await rateLimit(`newsletter:ip:${ip}`, 5, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Túl sok próbálkozás. Kérjük, várj néhány percet.' },
        { status: 429 },
      );
    }

    const body = await request.json();

    const result = newsletterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Érvényes e-mail cím szükséges.' },
        { status: 400 }
      );
    }

    const emailLimit = await rateLimit(`newsletter:email:${result.data.email}`, 2, 60 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { message: 'Sikeres feliratkozás!' },
      );
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: result.data.email },
      update: { active: true },
      create: { email: result.data.email },
    });

    // Push to MailerLite. Don't fail the user's request if MailerLite is down —
    // the DB upsert is the source of truth, admin can re-sync manually.
    const mlResult = await mailerliteSubscribe({ email: result.data.email });
    if (!mlResult.ok) {
      console.error('MailerLite subscribe failed:', mlResult.error);
    }

    return NextResponse.json({ message: 'Sikeres feliratkozás!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a feliratkozás során.' },
      { status: 500 }
    );
  }
}
