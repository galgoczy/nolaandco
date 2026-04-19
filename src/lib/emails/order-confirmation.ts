import { emailLayout } from './layout';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  babyName?: string | null;
  posterLayoutLabel?: string | null;
}

interface OrderConfirmationData {
  customerName: string;
  orderId: string;
  orderUrl: string;
  items?: OrderItem[];
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  shippingMethod?: string;
  hasInvoice?: boolean;
  paymentMethod?: 'card' | 'transfer';
}

const BANK_ACCOUNT = '10918001-00000047-88110009';
const BANK_BENEFICIARY = 'Galgóczy Krisztina EV';

function formatPrice(amount: number): string {
  return amount.toLocaleString('hu-HU') + ' Ft';
}

export function orderConfirmationSubject(): string {
  return 'Megkaptuk! Készül a Nola & Co emlékőrződ! 🦌';
}

export function orderConfirmationHtml(data: OrderConfirmationData): string {
  let itemsHtml = '';

  if (data.items && data.items.length > 0) {
    const rows = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A4A4A;">
          ${item.name}${item.quantity > 1 ? ` <span style="color:#999;">&times;${item.quantity}</span>` : ''}
          ${item.babyName ? `<br/><span style="font-size:12px;color:#999;">${item.babyName}</span>` : ''}
          ${item.posterLayoutLabel ? `<br/><span style="font-size:12px;color:#999;">Dizájn: ${item.posterLayoutLabel}</span>` : ''}
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A4A4A;white-space:nowrap;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>`
      )
      .join('');

    const shippingLabel =
      data.shippingMethod === 'parcel' ? 'Szállítás (Csomagautomata)' : 'Szállítás (Házhozszállítás)';

    itemsHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:2px solid #E8E6E1;">
      ${rows}
      ${
        data.shippingCost != null
          ? `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#999;">
          ${shippingLabel}
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#999;white-space:nowrap;">
          ${data.shippingCost === 0 ? 'Ingyenes' : formatPrice(data.shippingCost)}
        </td>
      </tr>`
          : ''
      }
      ${
        data.total != null
          ? `<tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;">
          Összesen
        </td>
        <td align="right" style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;white-space:nowrap;">
          ${formatPrice(data.total)}
        </td>
      </tr>`
          : ''
      }
    </table>`;
  }

  const invoiceNote = data.hasInvoice
    ? `<p style="margin:0 0 16px;font-size:13px;color:#999;font-style:italic;">
        A számlát csatoltuk ehhez az e-mailhez.
      </p>`
    : '';

  const orderRef = `#${data.orderId.slice(-8).toUpperCase()}`;

  const transferBlock =
    data.paymentMethod === 'transfer' && data.total != null
      ? `
    <div style="margin:24px 0;padding:18px 20px;background-color:#F5F0E8;border-radius:10px;border:1px solid #E8E0D0;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#4A4A4A;">
        Banki átutalás
      </p>
      <p style="margin:0 0 12px;font-size:13px;line-height:1.7;color:#4A4A4A;">
        A rendelést banki átutalással fizeted. Az alábbi adatokkal kérjük utalni az összeget. A termék elkészítése és postázása az utalás beérkezését követően történik.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px;color:#4A4A4A;line-height:1.8;">
        <tr><td style="padding-right:14px;color:#999;">Összeg:</td><td><strong>${formatPrice(data.total)}</strong></td></tr>
        <tr><td style="padding-right:14px;color:#999;">Bankszámlaszám:</td><td><strong>${BANK_ACCOUNT}</strong></td></tr>
        <tr><td style="padding-right:14px;color:#999;">Kedvezményezett:</td><td>${BANK_BENEFICIARY}</td></tr>
        <tr><td style="padding-right:14px;color:#999;">Közlemény:</td><td><strong>${orderRef}</strong></td></tr>
      </table>
    </div>`
      : '';

  const trackingNote =
    data.paymentMethod === 'transfer'
      ? 'Amint az utalás beérkezett, megkezdjük a baba születési adatainak feldolgozását, és küldünk egy újabb értesítést a csomagod útnak indításáról.'
      : 'A rendelésedet rögzítettük, és műhelyünkben megkezdtük a baba születési adatainak feldolgozását. Amint az alkotás elkészült, küldünk egy újabb értesítést a csomagod útnak indításáról.';

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Kedves ${data.customerName}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Köszönjük a rendelésedet! Nagyon örülünk, hogy minket választottál, hogy megőrizzük a legelső pillanatok emlékét.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      A rendelésed (<strong>${orderRef}</strong>) ${data.paymentMethod === 'transfer' ? 'rögzítve. ' : ''}${trackingNote}
    </p>
    ${itemsHtml}
    ${transferBlock}
    ${invoiceNote}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#C4A591;border-radius:8px;">
          <a href="${data.orderUrl}" style="display:inline-block;padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            Rendelés részletei
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Ha kérdésed merülne fel a gyártással kapcsolatban, írj nekünk a
      <a href="mailto:rendeles@nolaandco.hu" style="color:#C4A591;text-decoration:none;">rendeles@nolaandco.hu</a> címre!
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br />
      <strong>A Nola & Co. csapata</strong>
    </p>`;
  return emailLayout(body);
}
