import { emailLayout } from './layout';

interface FoxpostShippingData {
  customerName: string;
  /** Foxpost tracking number / barcode shown to the customer. */
  trackingNumber: string;
  /** Public Foxpost tracking URL. The customer can paste the number here
   *  if the page doesn't accept a query-string deep-link. */
  trackingUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function foxpostShippingSubject(): string {
  return 'A Nola & Co emlékőrződ úton van! 📦';
}

export function foxpostShippingHtml(data: FoxpostShippingData): string {
  const trackingBlock = `
    <div style="margin:20px 0;padding:18px 20px;background-color:#F5F0E8;border-radius:10px;border:1px solid #E8E0D0;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;">
        Csomagazonosító
      </p>
      <p style="margin:0 0 14px;font-size:20px;font-family:'Courier New',monospace;font-weight:700;color:#4A4A4A;letter-spacing:0.04em;">
        ${escapeHtml(data.trackingNumber)}
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td align="center" style="background-color:#C4A591;border-radius:8px;">
            <a href="${escapeHtml(data.trackingUrl)}" style="display:inline-block;padding:12px 28px;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
              Csomag nyomkövetése
            </a>
          </td>
        </tr>
      </table>
    </div>`;

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Kedves ${escapeHtml(data.customerName)}!
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Nagy örömmel értesítünk, hogy a rendelésed elkészült, és a mai napon
      átadtuk a Foxpost futárszolgálatnak &mdash; már úton van hozzád! 🦌
    </p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      A csomagod aktuális állapotát itt tudod nyomon követni:
    </p>
    ${trackingBlock}
    <p style="margin:16px 0 16px;font-size:14px;line-height:1.7;color:#4A4A4A;">
      <strong>Csomagautomatás kézbesítésnél</strong>: amint a csomagod megérkezik a
      választott automatába, a Foxpost külön emailben és SMS-ben értesít a
      kinyitási kódról és az időablakról.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Reméljük, hogy a csomag kibontása legalább akkora öröm lesz, mint
      amekkora szeretettel mi készítettük. Ne felejts el megjelölni minket
      az első közös fotón!
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#C4A591;">
      @nolaandco.baby &nbsp; #nolaandco
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Üdvözlettel:<br />
      <strong>A Nola &amp; Co. csapata</strong>
    </p>`;
  return emailLayout(body);
}

/** Plain-text Telegram message — same shape as our other admin pings. */
export function foxpostShippingTelegramText(data: {
  orderId: string;
  customerName: string;
  shippingMethodLabel: string;
  shippingAddress: string;
  trackingNumber: string;
  items: Array<{ name: string; quantity: number; babyName?: string | null }>;
}): string {
  const orderRef = `#${data.orderId.slice(-8).toUpperCase()}`;
  const lines: string[] = [];
  lines.push(`📦 <b>Csomag feladva!</b> ${escapeHtml(orderRef)}`);
  lines.push('');
  lines.push(`<b>Vevő:</b> ${escapeHtml(data.customerName)}`);
  lines.push(`<b>Szállítás:</b> ${escapeHtml(data.shippingMethodLabel)}`);
  lines.push(`<b>Cím:</b> ${escapeHtml(data.shippingAddress)}`);
  lines.push(`<b>Tracking:</b> <code>${escapeHtml(data.trackingNumber)}</code>`);
  lines.push('');
  lines.push('<b>Tételek:</b>');
  for (const item of data.items) {
    const qty = item.quantity > 1 ? ` × ${item.quantity}` : '';
    lines.push(`• ${escapeHtml(item.name)}${qty}`);
    if (item.babyName) {
      lines.push(`    <i>${escapeHtml(item.babyName)}</i>`);
    }
  }
  return lines.join('\n');
}
