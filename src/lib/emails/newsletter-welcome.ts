import { emailLayout } from './layout';

interface NewsletterWelcomeData {
  couponCode: string;
  validUntil: Date;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Budapest',
  }).format(d);
}

export function newsletterWelcomeSubject(): string {
  return 'Üdv a Nola családban! 🤍 Itt az ajándékod';
}

export function newsletterWelcomeHtml(data: NewsletterWelcomeData): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Üdv a Nola családban! 🤍
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Köszönjük, hogy feliratkoztál a hírlevelünkre! Elsőként értesülsz majd a limitált
      kollekciókról és az újdonságokról.
    </p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Ígéretünkhöz híven itt az ajándékod: egy <strong>INGYENES csomagautomatás szállítás</strong>
      kupon az első rendelésedhez.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#F5F4EF;border-radius:12px;padding:24px;">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#999;">Kuponkódod</p>
          <p style="margin:0 0 12px;font-size:30px;font-weight:700;letter-spacing:4px;color:#C4A591;">${data.couponCode}</p>
          <p style="margin:0;font-size:13px;color:#999;">Ingyenes csomagautomatás szállítás &middot; egyszer használható</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4A4A4A;">
      A kódot a pénztárnál tudod beváltani, csomagautomatás szállítás választása esetén.
      <strong>Felhasználható ${formatDate(data.validUntil)}-ig.</strong>
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#C4A591;border-radius:8px;">
          <a href="https://nolaandco.hu/termekek" style="display:inline-block;padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            Irány a webshop
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br /><strong>A Nola & Co. csapata</strong>
    </p>`;

  return emailLayout(body);
}
