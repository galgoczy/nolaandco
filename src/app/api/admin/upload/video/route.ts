import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAdminRequest } from '@/lib/admin-auth';

/**
 * Kliens-oldali videófeltöltés a Vercel Blobba. A fájl közvetlenül a
 * tárolóba megy (ez a route csak a feltöltési tokent adja ki), így nem
 * ütközik a szerverfüggvények 4,5 MB-os kérésméret-korlátjába.
 */
const MAX_VIDEO_SIZE = 64 * 1024 * 1024; // 64 MB — rövid, optimalizált MP4-ekhez

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Videófeltöltés nincs beállítva (BLOB_READ_WRITE_TOKEN hiányzik).' },
      { status: 500 },
    );
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
        maximumSizeInBytes: MAX_VIDEO_SIZE,
        addRandomSuffix: true,
      }),
      // A feltöltés tényét a termék mentése rögzíti; itt nincs teendő.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Feltöltés sikertelen';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
