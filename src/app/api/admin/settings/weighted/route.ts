import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getWeightedConfig, normalizeWeightedConfig, setWeightedConfig } from '@/lib/weightedPillow.server';

/** Súlyarányos párna központi beállításai (maximum, ár, státusz, tájékoztató). */
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getWeightedConfig());
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const config = normalizeWeightedConfig(body);
  await setWeightedConfig(config);
  return NextResponse.json(config);
}
