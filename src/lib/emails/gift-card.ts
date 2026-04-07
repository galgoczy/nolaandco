import { emailLayout } from './layout';
import { formatPrice } from '../utils';

interface GiftCardData {
  customerName: string;
  amount: number;
  code: string;
}

export function giftCardSubject(): string {
  return 'Egy különleges ajándék érkezett – Nola & Co. 🦌';
}

export function giftCardHtml(data: GiftCardData): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Kedves ${data.customerName}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Köszönjük a rendelésedet! Itt találod az ajándékutalványodat, amelyet <strong>${formatPrice(data.amount)}</strong> értékben állítottunk ki.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#F5F4EF;border-radius:12px;padding:24px;">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#999;">Ajándékutalvány kódod</p>
          <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:3px;color:#C4A591;">${data.code}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Ezt a kódot a webshopunkban, a fizetési folyamatnál tudod érvényesíteni. Az utalvány tartalmazza a csomagautomatás szállítást is, így az ajándékozottnak semmilyen extra költsége nem lesz.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#999;">
      Érvényesség: 1 év.
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br />
      <strong>A Nola & Co. csapata</strong>
    </p>`;
  return emailLayout(body);
}
