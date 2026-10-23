import type { OrderConfirmationData } from './order-confirmation';
import { pillowVariantName } from '@/lib/weightedPillow';
import { URGENT_FIRST_FEE } from '@/lib/urgentProduction';

/**
 * Mintarendelések a visszaigazoló e-mail kinézetének ellenőrzéséhez (admin →
 * Beállítások → Teszt e-mailek). Minden rendeléstípust lefednek, amelyre a
 * sablon másképp reagál: párna (normál / sürgős / súlyarányos előrendelés),
 * poszter, variánsos névre szóló termék, ajándékkártya, átutalás, vegyes kosár.
 * Valódi rendelést nem hoznak létre.
 */

const PARCEL = 1190;
const HOME = 3690;

type Sample = { label: string; data: Omit<OrderConfirmationData, 'orderUrl'> };

const sum = (items: { price: number; quantity: number }[]) => items.reduce((s, i) => s + i.price * i.quantity, 0);

export function testOrderSamples(weightedInfo: string, weightedPrice: number): Sample[] {
  const note = weightedInfo.trim() || 'Várható feladás: a beállításokban megadott tájékoztató szerint.';
  const lightPillow = (name: string, babyName: string, urgent = false) => ({
    name: pillowVariantName(name, false),
    quantity: 1,
    price: 22900,
    babyName,
    pillow: true,
    weighted: false,
    birthHeight: '50',
    birthWeight: '3250',
    urgent,
  });
  const weightedPillow = (name: string, babyName: string) => ({
    name: pillowVariantName(name, true),
    quantity: 1,
    price: weightedPrice,
    babyName,
    pillow: true,
    weighted: true,
    weightedStatus: 'preorder',
    productionNote: note,
    birthHeight: '52',
    birthWeight: '3480',
  });

  const samples: Sample[] = [];
  const add = (label: string, data: Omit<Sample['data'], 'customerName' | 'orderId'>) =>
    samples.push({
      label,
      data: {
        customerName: 'Teszt Vásárló',
        orderId: `test-order-TESZT${String(samples.length + 1).padStart(3, '0')}`,
        ...data,
      },
    });

  {
    const items = [lightPillow('ORIGIN Core', 'Panna')];
    const subtotal = sum(items);
    add('Emlékpárna, normál elkészítés, bankkártya', {
      items, subtotal, shippingCost: PARCEL, shippingMethod: 'parcel', total: subtotal + PARCEL,
      paymentMethod: 'card', hasPillow: true,
    });
  }
  {
    const items = [lightPillow('NOVA Linea', 'Bence', true)];
    const subtotal = sum(items);
    add('Emlékpárna, sürgősségi elkészítés', {
      items, subtotal, urgentFee: URGENT_FIRST_FEE, shippingCost: 0, shippingMethod: 'parcel',
      total: subtotal + URGENT_FIRST_FEE, paymentMethod: 'card', hasPillow: true,
    });
  }
  {
    const items = [weightedPillow('ORIGIN Atelier', 'Lili')];
    const subtotal = sum(items);
    add('Súlyarányos emlékpárna, előrendelés', {
      items, subtotal, shippingCost: 0, shippingMethod: 'parcel', total: subtotal, paymentMethod: 'card',
    });
  }
  {
    const items = [{ name: 'ORIGIN poszter', quantity: 1, price: 5900, babyName: 'Zalán', posterLayoutLabel: 'Origin 2' }];
    const subtotal = sum(items);
    add('Születési poszter', {
      items, subtotal, shippingCost: PARCEL, shippingMethod: 'parcel', total: subtotal + PARCEL, paymentMethod: 'card',
    });
  }
  {
    const items = [
      { name: 'Mikulás csizma - Santa Claus – Plüss szegéllyel - névre szólóan', quantity: 1, price: 7900, babyName: 'Panna' },
      { name: 'NOLA Hush szundikendő – zsálya', quantity: 1, price: 4900 },
    ];
    const subtotal = sum(items);
    add('Variánsos, névre szóló termék + szundikendő, banki átutalás', {
      items, subtotal, shippingCost: HOME, shippingMethod: 'home', total: subtotal + HOME, paymentMethod: 'transfer',
    });
  }
  {
    const items = [{ name: 'Nola Digitális Ajándékkártya', quantity: 1, price: 10000 }];
    const subtotal = sum(items);
    add('Digitális ajándékkártya', {
      items, subtotal, total: subtotal, paymentMethod: 'card', hasGiftCard: true,
    });
  }
  {
    const items = [lightPillow('NOVA Core', 'Máté', true), { name: 'NOLA Cloud takaró – bézs-zsálya', quantity: 1, price: 14900 }];
    const subtotal = sum(items);
    const discount = Math.round(subtotal * 0.1);
    add('Vegyes kosár: sürgős párna + takaró, kuponnal', {
      items, subtotal, discount, couponCode: 'TESZT10', urgentFee: URGENT_FIRST_FEE, shippingCost: 0,
      shippingMethod: 'parcel', total: subtotal - discount + URGENT_FIRST_FEE, paymentMethod: 'card',
      hasPillow: true, mixedUrgent: true,
    });
  }
  {
    const items = [weightedPillow('NOVA Atelier', 'Hanna'), { name: 'NOLA Hero – A Védelmező Kalandköpeny', quantity: 1, price: 12900, babyName: 'Hanna' }];
    const subtotal = sum(items);
    add('Vegyes kosár: súlyarányos előrendelés + kalandköpeny', {
      items, subtotal, shippingCost: 0, shippingMethod: 'parcel', total: subtotal, paymentMethod: 'card',
      mixedPreorder: true,
    });
  }
  return samples;
}
