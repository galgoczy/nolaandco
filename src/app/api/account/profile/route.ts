import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { mailerliteSubscribe, mailerliteUnsubscribe } from '@/lib/mailerlite';

// Safe fields exposed to the client — never leak passwordHash or reset/verify tokens.
const customerPublicSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  phone: true,
  shippingName: true,
  shippingZip: true,
  shippingCity: true,
  shippingAddress: true,
  shippingNote: true,
  billingZip: true,
  billingCity: true,
  billingAddress: true,
  newsletter: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ customer: null });
  }

  const customer = await prisma.customer.findUnique({
    where: { email: session.user.email },
    select: customerPublicSelect,
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
    billingZip,
    billingCity,
    billingAddress,
    newsletter,
  } = body as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() || null : null);

  const existing = await prisma.customer.findUnique({
    where: { email: session.user.email },
  });
  const wantsNewsletter = Boolean(newsletter);

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
      billingZip: str(billingZip),
      billingCity: str(billingCity),
      billingAddress: str(billingAddress),
      newsletter: wantsNewsletter,
    },
    update: {
      name: str(name),
      phone: str(phone),
      shippingName: str(shippingName),
      shippingZip: str(shippingZip),
      shippingCity: str(shippingCity),
      shippingAddress: str(shippingAddress),
      shippingNote: str(shippingNote),
      billingZip: str(billingZip),
      billingCity: str(billingCity),
      billingAddress: str(billingAddress),
      newsletter: wantsNewsletter,
    },
    select: customerPublicSelect,
  });

  // Sync newsletter status to MailerLite when the opt-in flag changed.
  const previous = existing?.newsletter ?? false;
  if (wantsNewsletter !== previous) {
    try {
      if (wantsNewsletter) {
        await prisma.newsletterSubscriber.upsert({
          where: { email: session.user.email },
          update: { active: true },
          create: { email: session.user.email },
        });
        const res = await mailerliteSubscribe({
          email: session.user.email,
          name: str(name) || str(shippingName) || undefined,
        });
        if (!res.ok) console.error('MailerLite subscribe failed:', res.error);
      } else {
        await prisma.newsletterSubscriber
          .update({
            where: { email: session.user.email },
            data: { active: false },
          })
          .catch(() => {});
        const res = await mailerliteUnsubscribe(session.user.email);
        if (!res.ok) console.error('MailerLite unsubscribe failed:', res.error);
      }
    } catch (err) {
      console.error('Newsletter sync error:', err);
    }
  }

  return NextResponse.json({ ok: true, customer });
}
