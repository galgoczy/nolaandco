/**
 * Meta Pixel vásárlási események.
 *
 * A pixel eddig csak `PageView`-t küldött. Enélkül a dinamikus katalógus-
 * hirdetés nem tud működni (nem tudja, ki melyik terméket nézte), és a Meta
 * nem tud vásárlásra optimalizálni, mert soha nem lát vásárlást.
 *
 * A hozzájárulást a pixel `consent` állapota kezeli (lásd Analytics.tsx):
 * elutasított sütiknél a Meta eldobja a beérkező eseményeket, ezért itt nem
 * kell külön ellenőrizni. Minden hívás néma, ha a pixel nem töltött be.
 */

type Fbq = (...args: unknown[]) => void;

function fbq(): Fbq | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { fbq?: Fbq }).fbq ?? null;
}

const CURRENCY = 'HUF';

/** Termékoldal megtekintése — ez a dinamikus hirdetések alapja. */
export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string | null;
}): void {
  fbq()?.('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    content_category: product.category ?? undefined,
    value: product.price,
    currency: CURRENCY,
  });
}

/** Kosárba helyezés. */
export function trackAddToCart(item: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  fbq()?.('track', 'AddToCart', {
    content_ids: [item.productId],
    content_name: item.name,
    content_type: 'product',
    contents: [{ id: item.productId, quantity: item.quantity }],
    value: item.price * item.quantity,
    currency: CURRENCY,
  });
}

/** A pénztár megnyitása. */
export function trackInitiateCheckout(cart: {
  items: { productId: string; quantity: number }[];
  value: number;
}): void {
  fbq()?.('track', 'InitiateCheckout', {
    content_ids: cart.items.map((i) => i.productId),
    content_type: 'product',
    contents: cart.items.map((i) => ({ id: i.productId, quantity: i.quantity })),
    num_items: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    value: cart.value,
    currency: CURRENCY,
  });
}

/**
 * Sikeres rendelés. Rendelésenként egyszer küldjük: a köszönőoldal
 * újratöltése vagy visszalépés különben többször számolna ugyanabból.
 */
export function trackPurchase(order: { orderId: string; value: number }): void {
  const key = `nola_purchase_${order.orderId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // Privát ablakban a sessionStorage dobhat — ilyenkor inkább elküldjük.
  }
  fbq()?.('track', 'Purchase', {
    value: order.value,
    currency: CURRENCY,
  });
}
