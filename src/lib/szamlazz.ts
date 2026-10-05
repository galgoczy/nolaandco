import { Client, Invoice, Buyer, Item, Seller, Currencies, Languages, PaymentMethods } from 'szamlazz.js';
import { sellerForOrder } from './sellers';
import { pillowVariantName } from './weightedPillow';

type OrderWithItems = {
  id: string;
  email: string;
  shippingName: string;
  shippingZip: string;
  shippingCity: string;
  shippingAddress: string;
  billingZip?: string | null;
  billingCity?: string | null;
  billingAddress?: string | null;
  billingCountry?: string | null;
  subtotal: number;
  shippingCost: number;
  urgentFee?: number;
  discount?: number;
  couponCode?: string | null;
  /** Az eladó a rendeléskor — ennek a Számlázz.hu fiókjából megy a számla. */
  sellerId?: string | null;
  total: number;
  items: {
    quantity: number;
    price: number;
    weighted?: boolean;
    product: {
      name: string;
      category?: string;
      weightedEnabled?: boolean;
    };
  }[];
};

// Eladónként (Számla Agent kulcsonként) egy kliens.
const clients = new Map<string, InstanceType<typeof Client>>();

function getClient(agentKeyEnv: string) {
  let client = clients.get(agentKeyEnv);
  if (!client) {
    const agentKey = process.env[agentKeyEnv];
    if (!agentKey) {
      throw new Error(`${agentKeyEnv} environment variable is not set`);
    }
    client = new Client({
      authToken: agentKey,
      eInvoice: false,
      requestInvoiceDownload: true,
      responseVersion: 2,
    });
    clients.set(agentKeyEnv, client);
  }
  return client;
}

export async function createSzamlazzInvoice(order: OrderWithItems) {
  // A számlát mindig az állítja ki, aki a rendeléskor az eladó volt.
  const client = getClient(sellerForOrder(order.sellerId).agentKeyEnv);

  const seller = new Seller({
    bank: {
      name: 'OTP Bank',
      accountNumber: '',
    },
    email: {
      replyToAddress: 'hello@nolaandco.hu',
      subject: 'Nola & Co - Számla',
      message: 'Köszönjük a vásárlást! Mellékeljük a számlát.',
    },
    issuerName: '',
  });

  const buyer = new Buyer({
    name: order.shippingName,
    country: order.billingCountry || 'Magyarország',
    zip: order.billingZip || order.shippingZip,
    city: order.billingCity || order.shippingCity,
    address: order.billingAddress || order.shippingAddress,
    email: order.email,
    // Don't let Számlázz.hu send the invoice separately — we attach
    // the PDF to our own order confirmation email instead.
    sendEmail: false,
    taxSubject: 0, // Unknown
  });

  const items = order.items.map(
    (item) =>
      new Item({
        // Párnánál a választott változat is a számlán (könnyű / súlyarányos).
        label:
          item.product.category === 'pillow' && (item.weighted || item.product.weightedEnabled)
            ? pillowVariantName(item.product.name, item.weighted)
            : item.product.name,
        quantity: item.quantity,
        unit: 'db',
        vat: 'AAM',
        grossUnitPrice: item.price,
      })
  );

  // Kuponkedvezmény negatív tételként — enélkül a számla végösszege a
  // kedvezmény előtti ár lett, és nem egyezett a ténylegesen fizetett összeggel.
  // A kupon csak a termékek árából von le (a felárból és a szállításból nem).
  if (order.discount && order.discount > 0) {
    items.push(
      new Item({
        label: order.couponCode ? `Kedvezmény (${order.couponCode})` : 'Kedvezmény',
        quantity: 1,
        unit: 'db',
        vat: 'AAM',
        grossUnitPrice: -order.discount,
      })
    );
  }

  // Sürgősségi elkészítés felára — külön tétel, nem a szállítási költség része.
  if (order.urgentFee && order.urgentFee > 0) {
    items.push(
      new Item({
        label: 'Sürgősségi elkészítés',
        quantity: 1,
        unit: 'db',
        vat: 'AAM',
        grossUnitPrice: order.urgentFee,
      })
    );
  }

  // Add shipping as a line item if there's a shipping cost
  if (order.shippingCost > 0) {
    items.push(
      new Item({
        label: 'Szállítási költség',
        quantity: 1,
        unit: 'db',
        vat: 'AAM',
        grossUnitPrice: order.shippingCost,
      })
    );
  }

  // Biztonsági ellenőrzés: a számla tételeinek összege egyezzen a fizetett összeggel.
  const invoiceTotal =
    order.items.reduce((sum, i) => sum + i.price * i.quantity, 0) -
    (order.discount ?? 0) +
    (order.urgentFee ?? 0) +
    order.shippingCost;
  if (invoiceTotal !== order.total) {
    console.error('Számla és rendelés végösszege eltér', {
      orderId: order.id,
      invoiceTotal,
      orderTotal: order.total,
    });
  }

  const now = new Date();

  // Same short, human-facing order number as the site/emails/Telegram.
  const orderNumber = order.id.slice(-8).toUpperCase();

  const invoice = new Invoice({
    paymentMethod: PaymentMethods.CreditCard,
    currency: Currencies.Ft,
    language: Languages.Hungarian,
    seller,
    buyer,
    items,
    paid: true,
    orderNumber,
    issueDate: now,
    fulfillmentDate: now,
    dueDate: now,
    comment: `Rendelés: #${orderNumber}`,
  });

  const result = await client.issueInvoice(invoice);
  console.log('Számlázz.hu invoice created:', result.invoiceId);
  return result;
}
