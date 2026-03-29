import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newsletterSchema } from '@/lib/validators';

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

    await prisma.newsletterSubscriber.upsert({
      where: { email: result.data.email },
      update: { active: true },
      create: { email: result.data.email },
    });

    return NextResponse.json({ message: 'Sikeres feliratkozás!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a feliratkozás során.' },
      { status: 500 }
    );
  }
}
