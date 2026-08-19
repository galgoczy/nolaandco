import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * Egykattintásos törlés a levélből. A sort valóban töröljük, nem csak
 * inaktívra tesszük — ez egyszeri szolgáltatásüzenet volt, nincs miért
 * megőrizni a címet.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (token) {
    await prisma.stockAlert.deleteMany({ where: { token } });
  }
  // Akkor is a visszaigazoló oldalra visz, ha a sor már nem létezett —
  // a felhasználó szempontjából az eredmény ugyanaz.
  return NextResponse.redirect(
    new URL('/ertesites-torolve', process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin),
  );
}
