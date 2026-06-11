import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAdminRequest } from '@/lib/admin-auth';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

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

  const blob = await put(key, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
