import { getResend, FROM_EMAIL } from '../resend';

interface Attachment {
  filename: string;
  content: Buffer;
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, error: err };
  }
}
