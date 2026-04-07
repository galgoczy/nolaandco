import { getResend, FROM_EMAIL } from '../resend';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
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
