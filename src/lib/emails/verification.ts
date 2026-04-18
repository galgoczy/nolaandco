import { emailLayout } from './layout';

export function verificationEmailSubject(): string {
  return 'Erősítsd meg az e-mail címed — Nola & Co.';
}

export function verificationEmailHtml(verifyUrl: string): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;color:#4A4A4A;letter-spacing:0.02em;">
      Üdv a Nola &amp; Co. családban!
    </h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4A4A4A;">
      Köszönjük, hogy regisztráltál. Kérjük, erősítsd meg az e-mail címed az alábbi gombra kattintva, hogy aktiváljuk a fiókodat.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${verifyUrl}"
             style="display:inline-block;background-color:#C4A591;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.04em;">
            E-mail cím megerősítése
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#999;">
      Ha a gomb nem működik, másold be az alábbi linket a böngésződbe:
    </p>
    <p style="margin:0 0 24px;font-size:12px;line-height:1.6;color:#C4A591;word-break:break-all;">
      <a href="${verifyUrl}" style="color:#C4A591;text-decoration:underline;">${verifyUrl}</a>
    </p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:#999;">
      A megerősítő link 24 óráig érvényes. Ha nem te regisztráltál, nyugodtan hagyd figyelmen kívül ezt az üzenetet.
    </p>
  `;
  return emailLayout(body);
}
