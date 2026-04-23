import { emailLayout } from './layout';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  babyName?: string | null;
  posterLayoutLabel?: string | null;
  birthDate?: string | null;
  birthWeight?: string | null;
  birthHeight?: string | null;
  birthTime?: string | null;
  customNote?: string | null;
}

interface OrderNotificationData {
  orderId: string;
  adminOrderUrl: string;
  customerName: string;
  email: string;
  phone?: string | null;
  shippingMethod?: string;
  shippingAddress?: string;
  shippingZip?: string;
  shippingCity?: string;
  billingAddress?: string;
  billingZip?: string | null;
  billingCity?: string | null;
  paymentMethod: 'card' | 'transfer';
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  hasGiftCard: boolean;
  couponCode?: string | null;
}

function formatPrice(amount: number): string {
  return amount.toLocaleString('hu-HU') + ' Ft';
}

export const ADMIN_NOTIFICATION_RECIPIENT = 'hello@nolaandco.hu';

export function orderNotificationSubject(orderId: string): string {
  return `Hurrá, új rendelés! #${orderId.slice(-8).toUpperCase()}`;
}

export function orderNotificationHtml(data: OrderNotificationData): string {
  const orderRef = `#${data.orderId.slice(-8).toUpperCase()}`;

  const rows = data.items
    .map((item) => {
      const detailParts: string[] = [];
      if (item.babyName) detailParts.push(`<strong>${escapeHtml(item.babyName)}</strong>`);
      if (item.birthDate) detailParts.push(`Születés: ${escapeHtml(item.birthDate)}`);
      if (item.birthTime) detailParts.push(`Időpont: ${escapeHtml(item.birthTime)}`);
      if (item.birthWeight) detailParts.push(`Súly: ${escapeHtml(item.birthWeight)}`);
      if (item.birthHeight) detailParts.push(`Hossz: ${escapeHtml(item.birthHeight)}`);
      if (item.posterLayoutLabel) detailParts.push(`Dizájn: ${escapeHtml(item.posterLayoutLabel)}`);

      const detailsLine = detailParts.length
        ? `<br/><span style="font-size:12px;color:#999;">${detailParts.join(' &middot; ')}</span>`
        : '';

      const noteLine = item.customNote
        ? `<br/><span style="font-size:12px;color:#999;font-style:italic;">Megjegyzés: ${escapeHtml(item.customNote).replace(/\n/g, '<br/>')}</span>`
        : '';

      return `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A4A4A;">
          ${escapeHtml(item.name)}${item.quantity > 1 ? ` <span style="color:#999;">&times;${item.quantity}</span>` : ''}
          ${detailsLine}
          ${noteLine}
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#4A4A4A;white-space:nowrap;vertical-align:top;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>`;
    })
    .join('');

  const shippingLabel =
    data.shippingMethod === 'parcel'
      ? 'Szállítás (Csomagautomata)'
      : data.shippingMethod === 'home'
        ? 'Szállítás (Házhozszállítás)'
        : null;

  const couponRow = data.couponCode
    ? `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#999;">Felhasznált kupon</td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#999;white-space:nowrap;">
          ${escapeHtml(data.couponCode)}
        </td>
      </tr>`
    : '';

  const itemsHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:2px solid #E8E6E1;">
      ${rows}
      ${
        shippingLabel
          ? `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#999;">${shippingLabel}</td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F0EDE8;font-size:14px;color:#999;white-space:nowrap;">
          ${data.shippingCost === 0 ? 'Ingyenes' : formatPrice(data.shippingCost)}
        </td>
      </tr>`
          : ''
      }
      ${couponRow}
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;">Összesen</td>
        <td align="right" style="padding:12px 0 0;font-size:16px;font-weight:600;color:#4A4A4A;white-space:nowrap;">
          ${formatPrice(data.total)}
        </td>
      </tr>
    </table>`;

  const paymentLabel = data.paymentMethod === 'transfer' ? 'Banki átutalás' : 'Bankkártya (Stripe)';

  const shippingInfoRows: Array<[string, string]> = [];
  if (data.shippingMethod) {
    shippingInfoRows.push([
      'Szállítási mód',
      data.shippingMethod === 'parcel' ? 'Csomagautomata' : 'Házhozszállítás',
    ]);
  }
  if (data.shippingAddress) {
    shippingInfoRows.push([
      'Szállítási cím',
      [data.shippingZip, data.shippingCity, data.shippingAddress].filter(Boolean).join(', '),
    ]);
  }
  if (data.billingAddress) {
    shippingInfoRows.push([
      'Számlázási cím',
      [data.billingZip, data.billingCity, data.billingAddress].filter(Boolean).join(', '),
    ]);
  }

  const infoTable = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px;color:#4A4A4A;line-height:1.8;margin:0 0 8px;">
      <tr><td style="padding-right:14px;color:#999;">Vevő</td><td><strong>${escapeHtml(data.customerName)}</strong></td></tr>
      <tr><td style="padding-right:14px;color:#999;">E-mail</td><td><a href="mailto:${escapeHtml(data.email)}" style="color:#C4A591;text-decoration:none;">${escapeHtml(data.email)}</a></td></tr>
      ${data.phone ? `<tr><td style="padding-right:14px;color:#999;">Telefon</td><td>${escapeHtml(data.phone)}</td></tr>` : ''}
      <tr><td style="padding-right:14px;color:#999;">Fizetés</td><td>${escapeHtml(paymentLabel)}</td></tr>
      ${shippingInfoRows
        .map(
          ([label, value]) =>
            `<tr><td style="padding-right:14px;color:#999;">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
        )
        .join('')}
    </table>`;

  const giftCardNote = data.hasGiftCard
    ? `<p style="margin:0 0 16px;font-size:13px;color:#C4A591;font-weight:600;">
        ⚠️ A rendelés ajándékkártyát tartalmaz — 24 órán belül küldeni kell.
      </p>`
    : '';

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Hurrá, új rendelés! 🎉
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Új rendelés érkezett (<strong>${orderRef}</strong>). Az alábbiakban találod a részleteket.
    </p>
    ${giftCardNote}
    ${infoTable}
    ${itemsHtml}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:#C4A591;border-radius:8px;">
          <a href="${data.adminOrderUrl}" style="display:inline-block;padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            Rendelés megnyitása az adminban
          </a>
        </td>
      </tr>
    </table>`;
  return emailLayout(body);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Plain-text (HTML-parsed) order summary for Telegram. Uses the same shape
// as orderNotificationHtml so both notifications stay in sync.
export function orderNotificationTelegramText(data: OrderNotificationData): string {
  const orderRef = `#${data.orderId.slice(-8).toUpperCase()}`;
  const paymentLabel = data.paymentMethod === 'transfer' ? 'Banki átutalás' : 'Bankkártya (Stripe)';

  const lines: string[] = [];
  lines.push(`🎉 <b>Új rendelés!</b> ${escapeHtml(orderRef)}`);
  if (data.hasGiftCard) {
    lines.push(`⚠️ <b>Ajándékkártyát tartalmaz</b> — 24 órán belül küldeni kell.`);
  }
  lines.push('');
  lines.push(`<b>Vevő:</b> ${escapeHtml(data.customerName)}`);
  lines.push(`<b>E-mail:</b> ${escapeHtml(data.email)}`);
  if (data.phone) lines.push(`<b>Telefon:</b> ${escapeHtml(data.phone)}`);
  lines.push(`<b>Fizetés:</b> ${escapeHtml(paymentLabel)}`);

  if (data.shippingMethod) {
    const shippingLabel = data.shippingMethod === 'parcel' ? 'Csomagautomata' : 'Házhozszállítás';
    lines.push(`<b>Szállítás:</b> ${escapeHtml(shippingLabel)}`);
    if (data.shippingAddress) {
      const addr = [data.shippingZip, data.shippingCity, data.shippingAddress].filter(Boolean).join(', ');
      lines.push(`<b>Szállítási cím:</b> ${escapeHtml(addr)}`);
    }
  }
  if (data.billingAddress) {
    const addr = [data.billingZip, data.billingCity, data.billingAddress].filter(Boolean).join(', ');
    lines.push(`<b>Számlázási cím:</b> ${escapeHtml(addr)}`);
  }

  lines.push('');
  lines.push('<b>Tételek:</b>');
  for (const item of data.items) {
    const qty = item.quantity > 1 ? ` × ${item.quantity}` : '';
    lines.push(`• ${escapeHtml(item.name)}${qty} — ${escapeHtml(formatPrice(item.price * item.quantity))}`);
    if (item.babyName) {
      lines.push(`    <b>${escapeHtml(item.babyName)}</b>`);
    }
    const detailParts: string[] = [];
    if (item.birthDate) detailParts.push(`Születés: ${escapeHtml(item.birthDate)}`);
    if (item.birthTime) detailParts.push(`Időpont: ${escapeHtml(item.birthTime)}`);
    if (item.birthWeight) detailParts.push(`Súly: ${escapeHtml(item.birthWeight)}`);
    if (item.birthHeight) detailParts.push(`Hossz: ${escapeHtml(item.birthHeight)}`);
    if (detailParts.length) {
      lines.push(`    <i>${detailParts.join(' · ')}</i>`);
    }
    if (item.posterLayoutLabel) {
      lines.push(`    <i>Dizájn: ${escapeHtml(item.posterLayoutLabel)}</i>`);
    }
    if (item.customNote) {
      lines.push(`    <i>Megjegyzés: ${escapeHtml(item.customNote).replace(/\n/g, ' ')}</i>`);
    }
  }

  lines.push('');
  if (data.shippingCost > 0) {
    lines.push(`Részösszeg: ${escapeHtml(formatPrice(data.subtotal))}`);
    lines.push(`Szállítás: ${escapeHtml(formatPrice(data.shippingCost))}`);
  }
  if (data.couponCode) {
    lines.push(`Felhasznált kupon: <b>${escapeHtml(data.couponCode)}</b>`);
  }
  lines.push(`<b>Összesen: ${escapeHtml(formatPrice(data.total))}</b>`);
  lines.push('');
  lines.push(`<a href="${data.adminOrderUrl}">Megnyitás az adminban</a>`);

  return lines.join('\n');
}
