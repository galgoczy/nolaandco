import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? '';

    // Handle logout via form (hidden _method=DELETE)
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const method = formData.get('_method');
      if (method === 'DELETE') {
        const response = NextResponse.redirect(new URL('/admin/bejelentkezes', request.url));
        response.cookies.set('admin_token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });
        return response;
      }
    }

    const ip = getClientIp(request.headers);
    const ipLimit = await rateLimit(`admin-login:ip:${ip}`, 5, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Túl sok próbálkozás. Kérjük, várj néhány percet.' },
        { status: 429 },
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail cím és jelszó megadása kötelező' },
        { status: 400 }
      );
    }

    const emailLimit = await rateLimit(`admin-login:email:${String(email).toLowerCase()}`, 10, 60 * 60 * 1000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: 'Túl sok sikertelen próbálkozás. Kérjük, várj egy órát.' },
        { status: 429 },
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Hibás e-mail cím vagy jelszó' },
        { status: 401 }
      );
    }

    const verification = await verifyPassword(password, admin.passwordHash);

    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Hibás e-mail cím vagy jelszó' },
        { status: 401 }
      );
    }

    // Lazy migration: replace legacy SHA-256 hash with bcrypt after a
    // successful login so the DB gradually moves to the stronger format.
    if (verification.needsUpgrade && verification.upgradedHash) {
      await prisma.adminUser
        .update({
          where: { id: admin.id },
          data: { passwordHash: verification.upgradedHash },
        })
        .catch((err) => console.error('Admin password hash upgrade failed:', err));
    }

    const token = createToken(admin.email);

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Szerverhiba történt' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
