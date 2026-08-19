import { randomBytes } from 'crypto';
import { prisma } from './prisma';
import { sendEmail } from './emails/send';
import { backInStockSubject, backInStockHtml } from './emails/back-in-stock';

/**
 * „Szólj, ha újra lesz" értesítések.
 *
 * A készlet a fizetéskori levonás óta magától csak csökken; felfelé kizárólag
 * adminban írják át. Ezért nem kell figyelő vagy ütemezett feladat: az
 * értesítés kiváltása ott történik, ahol a termék készlete 0-ról pozitívra
 * vált (src/app/api/admin/products/[id]/route.ts).
 */

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';
}

/**
 * Feliratkozás. Ugyanarra a termékre ugyanaz a cím csak egyszer szerepel;
 * ismételt feliratkozáskor a korábbi, már kiértesített sor újraaktiválódik.
 */
export async function subscribeToStockAlert(productId: string, email: string): Promise<void> {
  const token = randomBytes(24).toString('hex');
  await prisma.stockAlert.upsert({
    where: { productId_email: { productId, email } },
    // Ha korábban már kapott értesítőt és most újra feliratkozik, a sor
    // visszaáll várakozóra — a tokent megtartjuk, hogy a régi levélben lévő
    // törlés-link is működjön.
    update: { notifiedAt: null },
    create: { productId, email, token },
  });
}

/**
 * Kiküldi a várakozóknak az értesítőt, és elhasználja a feliratkozásokat.
 * Akkor hívandó, amikor a termék készlete 0-ról pozitívra váltott.
 *
 * Mindenki kap levelet, nem csak annyian, ahány darab érkezett: a sorban
 * állás igazságosabbnak hangzik, de a hátul állók napokig nem tudnának semmit.
 * A levél ezért kimondja, hogy kis szériáról van szó, és többen is megkapták.
 *
 * @returns hány értesítő ment ki
 */
export async function notifyBackInStock(productId: string): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, slug: true, imageUrl: true },
  });
  if (!product) return 0;

  const waiting = await prisma.stockAlert.findMany({
    where: { productId, notifiedAt: null },
    select: { id: true, email: true, token: true },
  });
  if (waiting.length === 0) return 0;

  const productUrl = `${baseUrl()}/termekek/${product.slug}`;
  const html = (token: string) =>
    backInStockHtml({
      productName: product.name,
      productUrl,
      imageUrl: product.imageUrl || null,
      unsubscribeUrl: `${baseUrl()}/api/stock-alert/leiratkozas?token=${token}`,
    });

  let sent = 0;
  for (const alert of waiting) {
    const result = await sendEmail({
      to: alert.email,
      subject: backInStockSubject(product.name),
      html: html(alert.token),
    });

    if (result.success) {
      // Csak a ténylegesen kiment leveleket jelöljük elhasználtnak, hogy egy
      // átmeneti küldési hiba ne nyelje el a feliratkozást.
      await prisma.stockAlert.update({
        where: { id: alert.id },
        data: { notifiedAt: new Date() },
      });
      sent++;
    } else {
      console.error('Készletértesítő nem ment ki', {
        productId,
        email: alert.email,
        error: result.error,
      });
    }
  }
  return sent;
}
