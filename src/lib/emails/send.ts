import { getResend, FROM_EMAIL } from '../resend';

interface Attachment {
  filename: string;
  content: Buffer;
}

// Replies go to the order desk, not to the verified From address.
// Using a different address here avoids loopback filtering by some MTAs.
const DEFAULT_REPLY_TO = 'rendeles@nolaandco.hu';

// Lightweight HTML → text converter for the multipart/alternative fallback.
// Goal: produce a clean, readable plain-text that strict filters (iCloud,
// MS365) expect next to the HTML. It isn't a full parser — enough for our
// own transactional templates.
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
    .replace(/<\/(table|ul|ol)>/gi, '\n\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) =>
      `${String(label).replace(/<[^>]+>/g, '').trim()} (${href})`,
    )
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, '[$1]')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&(?:#x27|apos);/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
  replyTo?: string;
}) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: replyTo ?? DEFAULT_REPLY_TO,
      subject,
      html,
      text: text ?? htmlToText(html),
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
    });

    if (error) {
      console.error('Resend error:', { to, subject, error });
      return { success: false, error };
    }

    console.log('Email sent', { to, subject, messageId: data?.id });
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Email send failed:', { to, subject, err });
    return { success: false, error: err };
  }
}
