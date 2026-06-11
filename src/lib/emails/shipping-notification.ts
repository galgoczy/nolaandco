import { emailLayout } from './layout';

interface ShippingNotificationData {
  customerName: string;
  trackingUrl: string;
}

export function shippingNotificationSubject(): string {
  return 'A Nola & Co emlékőrződ úton van! 📦';
}

export function shippingNotificationHtml(data: ShippingNotificationData): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Kedves ${data.customerName}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Örömmel értesítünk, hogy a rendelésed elhagyta a műhelyünket! A futárszolgálat már szállítja a csomagodat, amit az alábbi linken tudsz nyomon követni:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#C4A591;border-radius:8px;">
          <a href="${data.trackingUrl}" style="display:inline-block;padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            Csomag nyomkövetése
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Reméljük, hogy a csomag kibontása legalább akkora öröm lesz, mint amekkora szeretettel mi készítettük. Ne felejts el megjelölni minket az első közös fotón!
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#C4A591;">
      @nolaandco.baby &nbsp; #nolaandco
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Üdvözlettel:<br />
      <strong>A Nola & Co. csapata</strong>
    </p>`;
  return emailLayout(body);
}
