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
  discount?: number;
  couponCode?: string | null;
  total: number;
}

// Kept in sync with the bank details in order-confirmation.ts.
const BANK_ACCOUNT = '10918001-00000047-88110009';
const BANK_BENEFICIARY = 'Galgóczy Krisztina EV';

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
      Köszönjük a rendelésedet! Nagyon örülünk, hogy minket választottál, hogy megőrizzük a
      legelső pillanatok emlékét.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Azt vettük észre, hogy a <strong>#${data.orderNumber}</strong> rendelésed fizetése még nem
      fejeződött be, ezért a terméke(i)d gyártását még nem indítottuk el.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:2px solid #E8E6E1;">
      ${rows}
      ${
        data.discount && data.discount > 0
          ? `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A7c59;">
          Kedvezmény${data.couponCode ? ` (${data.couponCode})` : ''}
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A7c59;white-space:nowrap;">
          -${formatPrice(data.discount)}
        </td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;">Fizetendő</td>
        <td align="right" style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;white-space:nowrap;">
          ${formatPrice(data.total)}
        </td>
      </tr>
    </table>

    <div style="margin:24px 0;padding:18px 20px;background-color:#F5F0E8;border-radius:10px;border:1px solid #E8E0D0;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#4A4A4A;">
        1. Fizetés banki átutalással
      </p>
      <p style="margin:0 0 12px;font-size:13px;line-height:1.7;color:#4A4A4A;">
        Az alábbi adatokkal kérjük utalni az összeget. A termék elkészítése és postázása az utalás
        beérkezését követően történik.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px;color:#4A4A4A;line-height:1.8;">
        <tr><td style="padding-right:14px;color:#999;">Összeg:</td><td><strong>${formatPrice(data.total)}</strong></td></tr>
        <tr><td style="padding-right:14px;color:#999;">Bankszámlaszám:</td><td><strong>${BANK_ACCOUNT}</strong></td></tr>
        <tr><td style="padding-right:14px;color:#999;">Kedvezményezett:</td><td>${BANK_BENEFICIARY}</td></tr>
        <tr><td style="padding-right:14px;color:#999;">Közlemény:</td><td><strong>#${data.orderNumber}</strong></td></tr>
      </table>
    </div>

    <p style="margin:24px 0 8px;font-size:14px;font-weight:600;color:#4A4A4A;">
      2. Vagy fizess bankkártyával, egyetlen kattintással
    </p>
    <p style="margin:0 0 4px;font-size:14px;line-height:1.7;color:#4A4A4A;">
      Ha gyorsabban végeznél, a lenti gombbal azonnal, biztonságosan fizethetsz bankkártyával &ndash;
      pontosan onnan folytatod, ahol abbahagytad, és a gyártást rögtön indítjuk.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;">
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
      rendezted, ezt az e-mailt nyugodtan hagyd figyelmen kívül. Kérdés esetén írj a
      <a href="mailto:rendeles@nolaandco.hu" style="color:#C4A591;">rendeles@nolaandco.hu</a> címre.
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br /><strong>A Nola & Co. csapata</strong>
    </p>`;

  return emailLayout(body);
}
