import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newsletterSchema } from '@/lib/validators';
import { mailerliteSubscribe } from '@/lib/mailerlite';
import { createNewsletterCoupon } from '@/lib/coupons';
import { sendEmail } from '@/lib/emails/send';
import { newsletterWelcomeSubject, newsletterWelcomeHtml } from '@/lib/emails/newsletter-welcome';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = newsletterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Érvényes e-mail cím szükséges.' },
        { status: 400 }
      );
    }

    const email = result.data.email.trim();

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email },
    });

    // Push to MailerLite. Don't fail the user's request if MailerLite is down —
    // the DB upsert is the source of truth, admin can re-sync manually.
    const mlResult = await mailerliteSubscribe({ email });
    if (!mlResult.ok) {
      console.error('MailerLite subscribe failed:', mlResult.error);
    }

    // Welcome e-mail with a single-use free parcel-shipping coupon. Sent only
    // on the first subscription (createNewsletterCoupon is idempotent and flags
    // whether the coupon is new), so re-subscribing won't spam or re-issue.
    try {
      const coupon = await createNewsletterCoupon(email);
      if (coupon?.isNew) {
        await sendEmail({
          to: email,
          subject: newsletterWelcomeSubject(),
          html: newsletterWelcomeHtml({ couponCode: coupon.code, validUntil: coupon.endsAt }),
        });
      }
    } catch (err) {
      console.error('Newsletter welcome email error:', err);
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
