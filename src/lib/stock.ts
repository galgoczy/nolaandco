import { prisma } from './prisma';

/**
 * Levonja a rendelés tételeit a készletből — rendelésenként pontosan egyszer.
 *
 * A zárat az `Order.stockAdjustedAt` adja: csak az a hívás megy tovább,
 * amelyik null-ról tudja beállítani. Ez azért kell, mert a Stripe ugyanazt a
 * webhookot többször is kézbesítheti, és az admin is átállíthatja kézzel
 * fizetettre ugyanazt a rendelést.
 *
 * Csak a követett készletű termékeket érinti: ahol a `stock` null, ott nincs
 * darabszám-nyilvántartás, azt békén hagyjuk. A készlet nem megy nulla alá —
 * ha valahogy mégis több fogyna, mint amennyi van, nullára állítjuk és
 * naplózzuk, hogy az eltérés kiderüljön.
 */
export async function applyStockForOrder(orderId: string): Promise<void> {
  const claim = await prisma.order.updateMany({
    where: { id: orderId, stockAdjustedAt: null },
    data: { stockAdjustedAt: new Date() },
  });
  if (claim.count === 0) return; // Már levontuk ennél a rendelésnél.

  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { productId: true, quantity: true },
  });

  // Ugyanaz a termék több tételként is szerepelhet (pl. eltérő névadatokkal),
  // ezért termékenként összesítünk, és egy lépésben vonunk le.
  const quantityByProduct: Record<string, number> = {};
  for (const item of items) {
    quantityByProduct[item.productId] = (quantityByProduct[item.productId] ?? 0) + item.quantity;
  }

  const productIds = Object.keys(quantityByProduct);
  for (const productId of productIds) {
    const quantity = quantityByProduct[productId];

    // Atomi levonás: a feltétel a WHERE-ben van, így két egyidejű rendelés
    // sem tud ugyanabból a darabból kétszer fogyasztani.
    const updated = await prisma.product.updateMany({
      where: { id: productId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    if (updated.count === 1) continue;

    // Idáig akkor jutunk, ha nincs készletkövetés (stock = null), vagy ha
    // kevesebb van raktáron, mint amennyit megrendeltek.
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, stock: true },
    });
    if (!product || product.stock === null) continue;

    await prisma.product.update({ where: { id: productId }, data: { stock: 0 } });
    console.error('Készlethiány: a rendelt mennyiség több volt a raktárkészletnél', {
      orderId,
      termek: product.name,
      keszletVolt: product.stock,
      rendelt: quantity,
    });
  }
}
