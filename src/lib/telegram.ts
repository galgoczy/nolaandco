// Lightweight Telegram sender for admin notifications. Reads the bot
// credentials from env vars so we never commit secrets. Returns success
// status; callers should log failures but not fail the request.
//
// Required env vars (set in Vercel):
//   TELEGRAM_BOT_TOKEN  — e.g. "8745649181:AAH..."
//   TELEGRAM_CHAT_ID    — numeric chat id (fetched once via getUpdates)

type TelegramResult = { success: true } | { success: false; error: unknown };

export async function sendTelegramMessage(text: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set' };
  }

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
      return { success: false, error: `Telegram API ${res.status}: ${body}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}
