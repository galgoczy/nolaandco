import { prisma } from './prisma';

/**
 * Telegram order notifications. Mirrors the admin e-mail: fired on each new
 * paid/placed order (card via webhook, transfer + zero-total via checkout).
 * Fail-safe — never throws into the order flow.
 *
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

const API_BASE = 'https://api.telegram.org';

function esc(s: string | null | undefined): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function huf(amount: number): string {
  return amount.toLocaleString('hu-HU') + ' Ft';
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing)');
    return false;
  }
  try {
    const res = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      console.error('Telegram sendMessage failed:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('Telegram sendMessage error:', err);
    return false;
  }
}

/** Human-readable shipping method, derived from the stored address/cost. */
function shippingLabel(order: { shippingAddress: string; shippingCost: number }): string | null {
  const addr = (order.shippingAddress || '').toLowerCase();
  if (addr.includes('foxpost') || addr.includes('csomagautomata') || addr.includes('packeta')) {
    return 'Csomagautomata';
  }
  if (order.shippingCost > 0 || order.shippingAddress) return 'Házhozszállítás';
  return null;
}

type OrderWithItems = NonNullable<Awaited<ReturnType<typeof loadOrder>>>;

function loadOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
}

export function buildNewOrderMessage(order: OrderWithItems): string {
  const ref = `#${order.id.slice(-8).toUpperCase()}`;
  const lines: string[] = [];

  lines.push(`🎉 <b>Új rendelés!</b> ${ref}`);
  lines.push('');
  lines.push(`<b>Vevő:</b> ${esc(order.shippingName)}`);
  lines.push(`<b>E-mail:</b> ${esc(order.email)}`);
  if (order.phone) lines.push(`<b>Telefon:</b> ${esc(order.phone)}`);
  lines.push(`<b>Fizetés:</b> ${order.paymentMethod === 'transfer' ? 'Banki átutalás' : 'Bankkártya'}`);

  const ship = shippingLabel(order);
  if (ship) lines.push(`<b>Szállítás:</b> ${ship}`);
  if (order.shippingAddress) {
    const addr = [order.shippingZip, order.shippingCity, order.shippingAddress].filter(Boolean).join(', ');
    lines.push(`<b>Szállítási cím:</b> ${esc(addr)}`);
  }
  if (order.billingAddress) {
    const billing = [order.billingZip, order.billingCity, order.billingAddress].filter(Boolean).join(', ');
    lines.push(`<b>Számlázási cím:</b> ${esc(billing)}`);
  }

  lines.push('');
  lines.push('<b>Tételek:</b>');
  for (const item of order.items) {
    const qty = item.quantity > 1 ? ` ×${item.quantity}` : '';
    lines.push(`• <b>${esc(item.product.name)}</b>${qty} — ${huf(item.price * item.quantity)}`);
    if (item.babyName) lines.push(`    ${esc(item.babyName)}`);
    const birth = [
      item.birthDate ? `Születés: ${item.birthDate}` : null,
      item.birthTime ? `Időpont: ${item.birthTime}` : null,
      item.birthWeight ? `Súly: ${item.birthWeight}` : null,
      item.birthHeight ? `Hossz: ${item.birthHeight}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    if (birth) lines.push(`    ${esc(birth)}`);
    if (item.customNote) lines.push(`    ${esc(item.customNote.replace(/\n/g, ', '))}`);
  }

  lines.push('');
  lines.push(`<b>Részösszeg:</b> ${huf(order.subtotal)}`);
  if (order.shippingCost > 0) lines.push(`<b>Szállítás:</b> ${huf(order.shippingCost)}`);
  if (order.discount > 0) {
    const couponPart = order.couponCode ? ` (${esc(order.couponCode)})` : '';
    lines.push(`<b>Kedvezmény:</b> -${huf(order.discount)}${couponPart}`);
  } else if (order.couponCode) {
    lines.push(`<b>Felhasznált kupon:</b> ${esc(order.couponCode)}`);
  }
  lines.push(`<b>Összesen:</b> ${huf(order.total)}`);

  return lines.join('\n');
}

/** Loads the order and sends the Telegram notification. Fire-and-forget safe. */
export async function notifyNewOrderTelegram(orderId: string): Promise<void> {
  try {
    const order = await loadOrder(orderId);
    if (!order) return;
    await sendTelegramMessage(buildNewOrderMessage(order));
  } catch (err) {
    console.error('Telegram order notification error:', err);
  }
}
