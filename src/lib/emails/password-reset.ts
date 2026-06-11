import { emailLayout } from './layout';

export function passwordResetSubject(): string {
  return 'Jelszó visszaállítása — Nola & Co.';
}

export function passwordResetHtml(resetUrl: string): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;color:#4A4A4A;letter-spacing:0.02em;">
      Jelszó visszaállítása
    </h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4A4A4A;">
      Kaptunk egy kérést a Nola &amp; Co. fiókod jelszavának visszaállítására. Kattints az alábbi gombra egy új jelszó megadásához.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${resetUrl}"
             style="display:inline-block;background-color:#C4A591;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.04em;">
            Új jelszó megadása
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#999;">
      Ha a gomb nem működik, másold be az alábbi linket a böngésződbe:
    </p>
    <p style="margin:0 0 24px;font-size:12px;line-height:1.6;color:#C4A591;word-break:break-all;">
      <a href="${resetUrl}" style="color:#C4A591;text-decoration:underline;">${resetUrl}</a>
    </p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:#999;">
      A link 1 óráig érvényes. Ha nem te kérted a jelszó visszaállítást, nyugodtan hagyd figyelmen kívül ezt az üzenetet — a jelszavad változatlan marad.
    </p>
  `;
  return emailLayout(body);
}
