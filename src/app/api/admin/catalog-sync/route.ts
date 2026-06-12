import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { syncCatalog } from '@/lib/catalogSync';

export const runtime = 'nodejs';

export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const log = await syncCatalog();
    return NextResponse.json({ log });
  } catch (err) {
    console.error('Catalog sync error:', err);
    return NextResponse.json(
      { error: 'A katalógus-szinkron hiba miatt megszakadt. Nézd meg a szerver logot.' },
      { status: 500 }
    );
  }
}
