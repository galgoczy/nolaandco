import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { createSzamlazzInvoice } from '@/lib/szamlazz';
import { sendEmail } from '@/lib/emails/send';
import { invoiceEmailHtml, invoiceEmailSubject } from '@/lib/emails/invoice';

export const runtime = 'nodejs';

const CLAIM = 'folyamatban';

/**
 * Admin: számla utólagos kiállítása egy fizetett rendeléshez, amelynek még
 * nincs számlája (pl. sikertelen automatikus kiállítás vagy átutalásos
 * rendelés). A rendeléskori eladó Számlázz.hu fiókjából készül; kérésre a
 * PDF-et a saját levelünkben küldjük el a vevőnek (nem a Számlázz.hu küldi).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { sendEmail?: unknown } | null;
  const sendToCustomer = body?.sendEmail === true;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: 'A rendelés nem található.' }, { status: 404 });
  if (order.status === 'pending' || order.status === 'cancelled') {
    return NextResponse.json({ error: 'Számla csak fizetett (nem függő, nem törölt) rendeléshez állítható ki.' }, { status: 400 });
  }
  if (order.invoiceNumber) {
    return NextResponse.json({ error: `Ehhez a rendeléshez már van számla (${order.invoiceNumber}).` }, { status: 409 });
  }

  // Foglalás: dupla kattintásnál se készüljön két számla.
  const claimed = await prisma.order.updateMany({
    where: { id, invoiceNumber: null },
    data: { invoiceNumber: CLAIM },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ error: 'A számla kiállítása már folyamatban van.' }, { status: 409 });
  }

  let invoiceId: string;
  let pdf: Buffer | undefined;
  try {
    const result = await createSzamlazzInvoice(order);
    invoiceId = String(result.invoiceId ?? '');
    if (result.pdf && Buffer.isBuffer(result.pdf) && result.pdf.length > 0) pdf = result.pdf;
    await prisma.order.update({ where: { id }, data: { invoiceNumber: invoiceId || 'kiállítva' } });
  } catch (err) {
    await prisma.order.update({ where: { id }, data: { invoiceNumber: null } });
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Utólagos számla hiba:', { orderId: id, err });
    return NextResponse.json({ error: `A Számlázz.hu nem állította ki a számlát: ${msg}` }, { status: 502 });
  }

  let emailed = false;
  if (sendToCustomer) {
    if (!pdf) {
      return NextResponse.json({
        invoiceNumber: invoiceId,
        emailed: false,
        warning: 'A számla elkészült, de a PDF nem jött vissza, ezért e-mailt nem küldtünk.',
      });
    }
    const orderNumber = order.id.slice(-8).toUpperCase();
    const result = await sendEmail({
      to: order.email,
      subject: invoiceEmailSubject(orderNumber),
      html: invoiceEmailHtml({ customerName: order.shippingName || 'Vásárlónk', orderNumber }),
      attachments: [{ filename: `szamla-${orderNumber}.pdf`, content: pdf }],
    });
    emailed = result.success;
    if (!emailed) {
      return NextResponse.json({
        invoiceNumber: invoiceId,
        emailed: false,
        warning: 'A számla elkészült, de az e-mail küldése nem sikerült.',
      });
    }
  }

  return NextResponse.json({ invoiceNumber: invoiceId, emailed });
}
