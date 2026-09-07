import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { isAdminRequest } from '@/lib/admin-auth';
import { generateVariants } from '@/lib/imageVariants.server';

export const runtime = 'nodejs';
// Az eredeti mellé 3 méret × 2 formátum készül; egy 48 MP-es fotónál ez pár másodperc.
export const maxDuration = 60;

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB — az eredeti érintetlenül kerül a Blobba
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

/**
 * Képfeltöltés: az eredeti változatlanul a Blobba kerül (bármikor újra
 * felhasználható), mellé elkészülnek a kiszolgált változatok
 * (lásd src/lib/imageVariants.ts). Ha a változatgyártás nem sikerül, az
 * eredetit is töröljük és hibát adunk — így nem maradhat kép változat nélkül.
 */
export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          'Képfeltöltés nincs beállítva. Add hozzá a Vercel Blob store-t a projekthez, és a BLOB_READ_WRITE_TOKEN env var-t.',
      },
      { status: 500 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Hiányzó fájl' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Csak JPG, PNG, WebP, GIF vagy AVIF kép tölthető fel' },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `A fájl mérete túl nagy (max ${Math.round(MAX_SIZE / 1024 / 1024)} MB)` },
      { status: 400 },
    );
  }

  // Sanitize filename — keep extension, strip other oddities.
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const base = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'kep';

  const key = `products/${base}.${ext}`;
  const original = Buffer.from(await file.arrayBuffer());

  const blob = await put(key, original, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });

  try {
    await generateVariants(blob.url, original);
  } catch (err) {
    console.error('Képváltozat-gyártás sikertelen, az eredetit töröljük:', blob.url, err);
    await del(blob.url).catch(() => undefined);
    return NextResponse.json(
      { error: 'A kép feltöltése nem sikerült (a változatok gyártása hibára futott). Próbáld újra.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: blob.url });
}
