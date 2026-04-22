// Lightweight Telegram sender for admin notifications. Reads the bot
// credentials from env vars so we never commit secrets. Returns success
// status; callers should log failures but not fail the request.
//
// Required env vars (set in Vercel):
//   TELEGRAM_BOT_TOKEN  — e.g. "8745649181:AAH..."
//   TELEGRAM_CHAT_ID    — one or more chat ids, comma-separated.
//                         Each recipient receives the same message.
//                         Use a group chat id (negative number) to fan
//                         out to multiple admins with a single entry.

type TelegramResult = { success: true } | { success: false; error: unknown };

function parseChatIds(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

async function sendToChat(token: string, chatId: string, text: string): Promise<TelegramResult> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { success: false, error: `Telegram API ${res.status} for ${chatId}: ${body}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendTelegramMessage(text: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = parseChatIds(process.env.TELEGRAM_CHAT_ID);

  if (!token || chatIds.length === 0) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set' };
  }

  const results = await Promise.all(chatIds.map((id) => sendToChat(token, id, text)));
  const failures = results.filter((r): r is { success: false; error: unknown } => !r.success);

  if (failures.length === 0) return { success: true };
  if (failures.length === results.length) {
    return { success: false, error: failures.map((f) => f.error) };
  }
  // Partial failure: log the broken recipients but treat the overall
  // notification as delivered, since at least one admin got it.
  console.error('Telegram: some recipients failed', { failures: failures.map((f) => f.error) });
  return { success: true };
}
