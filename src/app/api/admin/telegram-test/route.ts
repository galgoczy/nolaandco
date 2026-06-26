import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { sendTelegramMessage } from '@/lib/telegram';

export const runtime = 'nodejs';

export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
  const hasChat = !!process.env.TELEGRAM_CHAT_ID;
  if (!hasToken || !hasChat) {
    return NextResponse.json(
      {
        error: `Hiányzó beállítás: ${[
          !hasToken && 'TELEGRAM_BOT_TOKEN',
          !hasChat && 'TELEGRAM_CHAT_ID',
        ]
          .filter(Boolean)
          .join(', ')}`,
      },
      { status: 400 }
    );
  }

  const ok = await sendTelegramMessage(
    '🔔 <b>Teszt üzenet</b>\nA Nola &amp; Co. webshop Telegram-értesítője működik. ' +
      'Ha ezt látod, a bot token és a chat ID rendben van.'
  );

  if (!ok) {
    return NextResponse.json(
      { error: 'A Telegram nem fogadta el az üzenetet. Ellenőrizd a bot tokent és a chat ID-t (a szerver log részletet is ad).' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
