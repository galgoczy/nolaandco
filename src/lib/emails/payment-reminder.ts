import { emailLayout } from './layout';

interface ReminderItem {
  name: string;
  quantity: number;
  price: number;
}

interface PaymentReminderData {
  customerName: string;
  orderNumber: string;
  payUrl: string;
  items: ReminderItem[];
  total: number;
}

function formatPrice(amount: number): string {
  return amount.toLocaleString('hu-HU') + ' Ft';
}

export function paymentReminderSubject(orderNumber: string): string {
  return `Rendelésed még fizetésre vár – #${orderNumber}`;
}

export function paymentReminderHtml(data: PaymentReminderData): string {
  const rows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A4A4A;">
          ${item.name}${item.quantity > 1 ? ` <span style="color:#999;">&times;${item.quantity}</span>` : ''}
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A4A4A;white-space:nowrap;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>`,
    )
    .join('');

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Kedves ${data.customerName}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Köszönjük, hogy nálunk rendeltél! Azt vettük észre, hogy a
      <strong>#${data.orderNumber}</strong> rendelésed fizetése még nem fejeződött be, ezért a
      terméke(i)d gyártását még nem indítottuk el.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:2px solid #E8E6E1;">
      ${rows}
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;">Fizetendő</td>
        <td align="right" style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;white-space:nowrap;">
          ${formatPrice(data.total)}
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Nincs más dolgod, mint egyetlen kattintással befejezni a fizetést &ndash; pontosan onnan
      folytatod, ahol abbahagytad:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#C4A591;border-radius:8px;">
          <a href="${data.payUrl}" style="display:inline-block;padding:14px 32px;color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
            Fizesd ki kényelmesen 5 másodperc alatt bankkártyával
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#999;">
      A gomb egy biztonságos bankkártyás fizetőoldalra visz (Stripe). Ha időközben már
      rendezted, ezt az e-mailt nyugodtan hagyd figyelmen kívül.
    </p>
    <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#999;">
      Ha inkább átutalnál vagy kérdésed van, írj a
      <a href="mailto:rendeles@nolaandco.hu" style="color:#C4A591;">rendeles@nolaandco.hu</a> címre.
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br /><strong>A Nola & Co. csapata</strong>
    </p>`;

  return emailLayout(body);
}
