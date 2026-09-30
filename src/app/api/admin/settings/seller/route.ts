import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { isSellerId } from '@/lib/sellers';
import { getActiveSeller, getSellerSetting, setSellerSetting } from '@/lib/sellers.server';

/** Aktív eladó (szerződő, számlázó, adatkezelő) beállítása az adminból. */
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ setting: await getSellerSetting(), active: (await getActiveSeller()).id });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { setting?: unknown } | null;
  const setting = body?.setting;
  if (setting !== 'auto' && !isSellerId(setting)) {
    return NextResponse.json({ error: 'Hibás érték (auto | gergely | kriszti).' }, { status: 400 });
  }
  await setSellerSetting(setting);
  return NextResponse.json({ setting, active: (await getActiveSeller()).id });
}
