import { Client, Invoice, Buyer, Item, Seller, Currencies, Languages, PaymentMethods } from 'szamlazz.js';

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
  total: number;
  items: {
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
};

let clientInstance: InstanceType<typeof Client> | null = null;

function getClient() {
  if (!clientInstance) {
    const agentKey = process.env.SZAMLAZZ_AGENT_KEY;
    if (!agentKey) {
      throw new Error('SZAMLAZZ_AGENT_KEY environment variable is not set');
    }
    clientInstance = new Client({
      authToken: agentKey,
      eInvoice: false,
      requestInvoiceDownload: true,
      responseVersion: 2,
    });
  }
  return clientInstance;
}

export async function createSzamlazzInvoice(order: OrderWithItems) {
  const client = getClient();

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
        label: item.product.name,
        quantity: item.quantity,
        unit: 'db',
        vat: 'AAM',
        grossUnitPrice: item.price,
      })
  );

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
