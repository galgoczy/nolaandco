import { emailLayout } from './layout';
import { formatPrice } from '../utils';

export interface WithdrawalAckItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface WithdrawalAckData {
  declaredName: string;
  orderNumber: string; // short, human-facing order id
  items: WithdrawalAckItem[];
  refundAmount: number;
  /** Exact send timestamp (durable-medium proof). */
  sentAt: Date;
}

function formatTimestamp(d: Date): string {
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Budapest',
  }).format(d);
}

export function withdrawalAckSubject(orderNumber: string): string {
  return `Elállási nyilatkozat átvételi elismervénye – #${orderNumber}`;
}

/**
 * Durable-medium acknowledgment of receipt of the withdrawal declaration.
 * Contains the content of the declaration plus the exact date and time of
 * sending, as required by 45/2014. (II. 26.) Korm. rendelet.
 */
export function withdrawalAckHtml(data: WithdrawalAckData): string {
  const rows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#4A4A4A;">${item.productName} &times; ${item.quantity}</td>
        <td style="padding:8px 0;font-size:14px;color:#4A4A4A;text-align:right;white-space:nowrap;">${formatPrice(item.unitPrice * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#4A4A4A;font-weight:500;">
      Elállási nyilatkozat – átvételi elismervény
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Kedves ${data.declaredName}!
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4A4A4A;">
      Visszaigazoljuk, hogy elállási nyilatkozatodat <strong>megkaptuk</strong>. Ez az
      e-mail a beérkezés átvételi elismervénye, amelyet tartós adathordozón küldünk meg neked.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:#F5F4EF;border-radius:12px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#999;">A nyilatkozat tartalma</p>
        <p style="margin:0 0 6px;font-size:14px;color:#4A4A4A;"><strong>Nyilatkozattevő:</strong> ${data.declaredName}</p>
        <p style="margin:0 0 6px;font-size:14px;color:#4A4A4A;"><strong>Érintett rendelés:</strong> #${data.orderNumber}</p>
        <p style="margin:0 0 12px;font-size:14px;color:#4A4A4A;"><strong>Nyilatkozat:</strong> A fogyasztó a megjelölt termék(ek) tekintetében eláll a szerződéstől.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8E6E1;">
          ${rows}
          <tr>
            <td style="padding:10px 0 0;font-size:14px;color:#4A4A4A;font-weight:700;border-top:1px solid #E8E6E1;">Érintett összeg</td>
            <td style="padding:10px 0 0;font-size:14px;color:#4A4A4A;font-weight:700;text-align:right;border-top:1px solid #E8E6E1;">${formatPrice(data.refundAmount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4A4A4A;">
      <strong>Beérkezés (a nyilatkozat elküldése) időpontja:</strong><br />
      ${formatTimestamp(data.sentAt)} (közép-európai idő)
    </p>

    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4A4A4A;">
      Kérjük, a terméke(ke)t sértetlen, eredeti állapotban juttasd vissza hozzánk. A visszatérítést
      a jogszabályi határidőn belül teljesítjük, miután kollégánk feldolgozta a nyilatkozatot.
      A részletekről hamarosan külön e-mailben tájékoztatunk.
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4A4A4A;">
      Ha bármilyen kérdésed van, írj nekünk a
      <a href="mailto:rendeles@nolaandco.hu" style="color:#C4A591;">rendeles@nolaandco.hu</a> címre.
    </p>
    <p style="margin:24px 0 0;font-size:15px;color:#4A4A4A;">
      Szeretettel:<br /><strong>A Nola & Co. csapata</strong>
    </p>`;

  return emailLayout(body);
}

export function withdrawalAdminSubject(orderNumber: string): string {
  return `Új elállási nyilatkozat – #${orderNumber}`;
}

export function withdrawalAdminHtml(data: WithdrawalAckData & { contactEmail: string }): string {
  const rows = data.items
    .map(
      (item) =>
        `<li style="margin:0 0 4px;">${item.productName} &times; ${item.quantity} — ${formatPrice(item.unitPrice * item.quantity)}</li>`
    )
    .join('');

  const body = `
    <h1 style="margin:0 0 16px;font-size:20px;color:#4A4A4A;font-weight:500;">Új elállási nyilatkozat érkezett</h1>
    <p style="margin:0 0 8px;font-size:14px;color:#4A4A4A;"><strong>Rendelés:</strong> #${data.orderNumber}</p>
    <p style="margin:0 0 8px;font-size:14px;color:#4A4A4A;"><strong>Nyilatkozattevő:</strong> ${data.declaredName}</p>
    <p style="margin:0 0 8px;font-size:14px;color:#4A4A4A;"><strong>Kapcsolat:</strong> ${data.contactEmail}</p>
    <p style="margin:0 0 8px;font-size:14px;color:#4A4A4A;"><strong>Beérkezés:</strong> ${formatTimestamp(data.sentAt)}</p>
    <p style="margin:16px 0 4px;font-size:14px;color:#4A4A4A;"><strong>Érintett tételek:</strong></p>
    <ul style="margin:0 0 12px;padding-left:20px;font-size:14px;color:#4A4A4A;">${rows}</ul>
    <p style="margin:0;font-size:14px;color:#4A4A4A;"><strong>Visszatérítendő összeg:</strong> ${formatPrice(data.refundAmount)}</p>`;

  return emailLayout(body);
}
