import { emailLayout } from './layout';

interface PaymentReminderItem {
  name: string;
  quantity: number;
  price: number;
  babyName?: string | null;
  posterLayoutLabel?: string | null;
}

interface PaymentReminderData {
  customerName: string;
  orderId: string;
  items: PaymentReminderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  /** Optional Stripe Checkout URL letting the customer switch to card pay. */
  payByCardUrl?: string | null;
}

const BANK_ACCOUNT = '10918001-00000047-88110009';
const BANK_BENEFICIARY = 'Galgóczy Krisztina EV';

function formatPrice(amount: number): string {
  return amount.toLocaleString('hu-HU') + ' Ft';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function paymentReminderSubject(orderId: string): string {
  const ref = orderId.slice(-8).toUpperCase();
  return `Fizetési emlékeztető – Nola & Co rendelés #${ref}`;
}

export function paymentReminderHtml(data: PaymentReminderData): string {
  const orderRef = `#${data.orderId.slice(-8).toUpperCase()}`;

  const rows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A4A4A;">
          ${escapeHtml(item.name)}${item.quantity > 1 ? ` <span style="color:#999;">&times;${item.quantity}</span>` : ''}
          ${item.babyName ? `<br/><span style="font-size:12px;color:#999;">${escapeHtml(item.babyName)}</span>` : ''}
          ${item.posterLayoutLabel ? `<br/><span style="font-size:12px;color:#999;">Dizájn: ${escapeHtml(item.posterLayoutLabel)}</span>` : ''}
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A4A4A;white-space:nowrap;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>`,
    )
    .join('');

  const itemsHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:2px solid #E8E6E1;">
      ${rows}
      ${
        data.shippingCost > 0
          ? `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#999;">Szállítási költség</td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#999;white-space:nowrap;">
          ${formatPrice(data.shippingCost)}
        </td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;">Összesen</td>
        <td align="right" style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;white-space:nowrap;">
          ${formatPrice(data.total)}
        </td>
      </tr>
    </table>`;

  const transferBlock = `
    <div style="margin:24px 0;padding:18px 20px;background-color:#F5F0E8;border-radius:10px;border:1px solid #E8E0D0;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#4A4A4A;">
        Banki átutalás adatai
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px;color:#4A4A4A;line-height:1.8;">
        <tr><td style="padding-right:14px;color:#999;">Összeg</td><td><strong>${formatPrice(data.total)}</strong></td></tr>
        <tr><td style="padding-right:14px;color:#999;">Bankszámlaszám</td><td><strong>${BANK_ACCOUNT}</strong></td></tr>
        <tr><td style="padding-right:14px;color:#999;">Kedvezményezett</td><td>${BANK_BENEFICIARY}</td></tr>
        <tr><td style="padding-right:14px;color:#999;">Közlemény</td><td><strong>${orderRef}</strong></td></tr>
      </table>
    </div>`;

  const cardBlock = data.payByCardUrl
    ? `
    <div style="margin:24px 0;padding:18px 20px;background-color:#FFFFFF;border-radius:10px;border:1px solid #E8E0D0;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;color:#4A4A4A;">
        Vagy ha kényelmesebb, fizess <strong>bankkártyával</strong> egy kattintással:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td align="center" style="background-color:#C4A591;border-radius:8px;">
            <a href="${escapeHtml(data.payByCardUrl)}" style="display:inline-block;padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
              Fizetés bankkártyával
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:10px 0 0;font-size:11px;color:#999;">
        Biztonságos fizetés a Stripe felületén.
      </p>
    </div>`
    : '';

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Kedves ${escapeHtml(data.customerName)}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Köszönjük újra, hogy a Nola &amp; Co-t választottad! A rendelésedet (<strong>${orderRef}</strong>)
      banki átutalásos fizetéssel adtad le, és szeretnénk kedvesen emlékeztetni rá,
      hogy az utalás <strong>még nem érkezett meg</strong> hozzánk.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Mivel minden Nola párnát és posztert egyedileg, kézzel készítünk a megadott
      születési adatokkal, a gyártást csak az utalás beérkezése után tudjuk
      elindítani. Amint lehetőséged van rá, kérlek utald el az összeget &mdash;
      hogy minél hamarabb kezedbe adhassuk az emlékőrződ.
    </p>
    ${itemsHtml}
    ${transferBlock}
    ${cardBlock}
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Ha bármi kérdésed van, vagy időközben már elutaltad az összeget,
      írj nekünk a
      <a href="mailto:hello@nolaandco.hu" style="color:#C4A591;text-decoration:none;">hello@nolaandco.hu</a>
      címre &mdash; ebben az esetben elnézést kérünk az emlékeztetőért!
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Köszönjük a türelmedet, hamarosan találkozunk a csomagon keresztül!<br />
      <strong>A Nola &amp; Co. csapata</strong>
    </p>`;
  return emailLayout(body);
}
