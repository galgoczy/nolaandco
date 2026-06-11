import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken } from '@/lib/auth';

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

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail cím és jelszó megadása kötelező' },
        { status: 400 }
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

    const valid = verifyPassword(password, admin.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: 'Hibás e-mail cím vagy jelszó' },
        { status: 401 }
      );
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
