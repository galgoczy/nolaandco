/**
 * Minimal MailerLite (new API, v3) wrapper.
 *
 * Uses the public "Subscribers" endpoint to upsert a subscriber. We don't
 * assign groups — the account has no custom group and everything goes to the
 * default list.
 *
 * Required env:
 *   MAILERLITE_API_KEY — API token (Integrations → API in MailerLite dashboard)
 */
const API_BASE = 'https://connect.mailerlite.com/api';

type SubscribePayload = {
  email: string;
  name?: string | null;
  status?: 'active' | 'unsubscribed';
};

export async function mailerliteSubscribe({
  email,
  name,
  status = 'active',
}: SubscribePayload): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'MAILERLITE_API_KEY is not set' };
  }

  try {
    const res = await fetch(`${API_BASE}/subscribers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        status,
        fields: name ? { name } : undefined,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        error: `MailerLite API ${res.status}: ${text.slice(0, 300)}`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function mailerliteUnsubscribe(email: string) {
  return mailerliteSubscribe({ email, status: 'unsubscribed' });
}
