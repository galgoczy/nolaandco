import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { shippingSchema, homeDeliverySchema, foreignShippingSchema } from '@/lib/validators';
import { sendEmail } from '@/lib/emails/send';
import { orderConfirmationSubject, orderConfirmationHtml } from '@/lib/emails/order-confirmation';
import {
  ADMIN_NOTIFICATION_RECIPIENT,
  orderNotificationHtml,
  orderNotificationSubject,
} from '@/lib/emails/order-notification';
import { cartItemRequiresShipping } from '@/lib/shippingRules';
import { fulfillGiftCardsForOrder } from '@/lib/giftCards';
import { notifyNewOrderTelegram } from '@/lib/telegram';
import { getShippingCost, carrierForCountry, getCountryConfig, qualifiesForFreeParcel } from '@/lib/shipping';
import { applyStockForOrder } from '@/lib/stock';
import { isUrgentEnabled } from '@/lib/urgentProduction.server';
import { getActiveSeller } from '@/lib/sellers.server';
import { getOffers } from '@/lib/weightedPillow.server';
import { checkWeightedWeight, pillowVariantName } from '@/lib/weightedPillow';
import {
  URGENT_LABEL,
  hasSlowerItems,
  isUrgentEligible,
  urgentFeeFor,
  urgentGrantsFreeParcel,
} from '@/lib/urgentProduction';
import type { CartItemData } from '@/store/cart';

/**
 * Sends the customer confirmation and admin notification in parallel.
 * sendEmail resolves even on Resend failures, so we inspect the return
 * value explicitly and log delivery outcomes for both messages.
 */
async function sendOrderEmails(args: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone?: string | null;
  shippingMethod?: string;
  shippingAddress?: string;
  shippingZip?: string;
  shippingCity?: string;
  billingZip?: string | null;
  billingCity?: string | null;
  billingAddress?: string | null;
  paymentMethod: 'card' | 'transfer';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    babyName?: string | null;
    posterLayoutLabel?: string | null;
    urgent?: boolean;
    weighted?: boolean;
    weightedStatus?: string | null;
    productionNote?: string | null;
    birthWeight?: string | null;
    birthHeight?: string | null;
  }>;
  subtotal: number;
  shippingCost: number;
  discount?: number;
  couponCode?: string | null;
  urgentFee?: number;
  mixedUrgent?: boolean;
  mixedPreorder?: boolean;
  hasPillow?: boolean;
  total: number;
  hasGiftCard: boolean;
  hasInvoice: boolean;
  baseUrl: string;
}) {
  const customerSend = sendEmail({
    to: args.customerEmail,
    subject: orderConfirmationSubject(),
    html: orderConfirmationHtml({
      customerName: args.customerName,
      orderId: args.orderId,
      orderUrl: `${args.baseUrl}/fiok#rendelesek`,
      items: args.items,
      subtotal: args.subtotal,
      shippingCost: args.shippingCost,
      discount: args.discount,
      couponCode: args.couponCode,
      urgentFee: args.urgentFee,
      mixedUrgent: args.mixedUrgent,
      mixedPreorder: args.mixedPreorder,
      hasPillow: args.hasPillow,
      total: args.total,
      shippingMethod: args.shippingMethod,
      paymentMethod: args.paymentMethod,
      hasInvoice: args.hasInvoice,
      hasGiftCard: args.hasGiftCard,
    }),
  });

  const adminSend = sendEmail({
    to: ADMIN_NOTIFICATION_RECIPIENT,
    subject: orderNotificationSubject(args.orderId, (args.urgentFee ?? 0) > 0),
    html: orderNotificationHtml({
      orderId: args.orderId,
      adminOrderUrl: `${args.baseUrl}/admin/rendeles/${args.orderId}`,
      customerName: args.customerName,
      email: args.customerEmail,
      phone: args.phone ?? null,
      shippingMethod: args.shippingMethod,
      shippingAddress: args.shippingAddress,
      shippingZip: args.shippingZip,
      shippingCity: args.shippingCity,
      billingAddress: args.billingAddress ?? undefined,
      billingZip: args.billingZip ?? undefined,
      billingCity: args.billingCity ?? undefined,
      paymentMethod: args.paymentMethod,
      items: args.items,
      subtotal: args.subtotal,
      shippingCost: args.shippingCost,
      discount: args.discount,
      couponCode: args.couponCode,
      urgentFee: args.urgentFee,
      mixedUrgent: args.mixedUrgent,
      mixedPreorder: args.mixedPreorder,
      total: args.total,
      hasGiftCard: args.hasGiftCard,
    }),
  });

  const [customerResult, adminResult] = await Promise.all([customerSend, adminSend]);

  if (!customerResult.success) {
    console.error('Customer confirmation email NOT sent', {
      orderId: args.orderId,
      to: args.customerEmail,
      error: customerResult.error,
    });
  }
  if (!adminResult.success) {
    console.error('Admin notification email NOT sent', {
      orderId: args.orderId,
      to: ADMIN_NOTIFICATION_RECIPIENT,
      error: adminResult.error,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shipping, shippingMethod, shippingCountry, pickupPointId, paymentMethod, couponCode, saveData } = body as {
      items: CartItemData[];
      shipping: Record<string, unknown>;
      shippingMethod: string;
      shippingCountry?: string;
      pickupPointId?: string | null;
      paymentMethod?: 'card' | 'transfer';
      couponCode?: string | null;
      saveData?: boolean;
    };

    const payMethod: 'card' | 'transfer' = paymentMethod === 'transfer' ? 'transfer' : 'card';

    // Resolve shipping country & carrier. Packeta countries always ship to a
    // pickup point ('parcel'); HU keeps Foxpost parcel/home.
    const country = getCountryConfig(shippingCountry).code;
    const carrier = carrierForCountry(country);
    const effectiveMethod: 'parcel' | 'home' =
      carrier === 'packeta' ? 'parcel' : shippingMethod === 'home' ? 'home' : 'parcel';

    // Validate shipping data. Relaxed billing (no HU 4-digit zip) when shipping
    // abroad OR the invoice country is not Hungary; HU home delivery is stricter.
    const billingCountryRaw = typeof shipping?.billingCountry === 'string' ? shipping.billingCountry : 'HU';
    const relaxedBilling = country !== 'HU' || billingCountryRaw !== 'HU';
    const schema = relaxedBilling
      ? foreignShippingSchema
      : effectiveMethod === 'home'
        ? homeDeliverySchema
        : shippingSchema;
    const shippingResult = schema.safeParse(shipping);
    if (!shippingResult.success) {
      return NextResponse.json(
        { error: 'Érvénytelen számlázási / szállítási adatok.', details: shippingResult.error.flatten() },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'A kosár üres.' },
        { status: 400 }
      );
    }

    // Verify prices against DB
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // DB-backed variants (Baba textilek & dekorációk): the chosen variant is the
    // authority for both the surcharge and the availability check — never the
    // price the client sent.
    const variantIds = items
      .map((item) => item.variantId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    const variants = variantIds.length
      ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
      : [];
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const orderRequiresShipping = items.some((item) => {
      const product = productMap.get(item.productId);
      return cartItemRequiresShipping({
        slug: item.slug,
        variant: item.variant,
        category: product?.category,
        noShipping: product?.noShipping,
      });
    });

    let subtotal = 0;
    const verifiedItems: {
      productId: string;
      quantity: number;
      price: number;
      name: string;
      babyName?: string;
      birthDate?: string;
      birthWeight?: string;
      birthHeight?: string;
      birthTime?: string;
      customNote?: string;
      posterLayout?: string;
      posterLayoutLabel?: string;
      urgent: boolean;
      weighted: boolean;
      weightedStatus?: 'preorder' | 'available';
      productionNote?: string;
      category: string;
      ships: boolean;
    }[] = [];

    // Méret- és súlyarányos párnák: az aktuális ajánlat (ár, maximum, státusz)
    // mindig a szerveren dől el — a kosárban tárolt adatnak nem hiszünk.
    const weightedOffers = await getOffers(items.filter((i) => i.weighted === true).map((i) => i.productId));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `A(z) "${item.name}" termék nem található vagy nem elérhető.` },
          { status: 400 }
        );
      }

      // Emlékpárna csak a teljes személyre szabási adatokkal rendelhető — az
      // elkészítési idő ezek beérkezésével indul, hiányosan nem fogadjuk el.
      if (product.category === 'pillow') {
        const missing = [item.babyName, item.birthDate, item.birthWeight, item.birthHeight].some(
          (v) => typeof v !== 'string' || v.trim() === '',
        );
        if (missing) {
          return NextResponse.json(
            {
              error: `A(z) "${item.name}" személyre szabási adatai hiányosak (név, születési dátum, súly, hossz). Kérlek, töröld a tételt a kosárból, és tedd be újra a termékoldalon az adatokkal együtt.`,
            },
            { status: 400 },
          );
        }
      }

      // For variant products (poster/giftcard), use the cart item price
      // since the DB only stores the base price
      const isVariant = product.category === 'poster' || product.category === 'giftcard';
      const variantCandidate = item.variantId ? variantMap.get(item.variantId) : undefined;
      // Ignore a variant that doesn't belong to this product (stale/forged cart).
      const chosenVariant =
        variantCandidate && variantCandidate.productId === product.id ? variantCandidate : undefined;

      // Availability: an explicit stock of 0 blocks the order (null = untracked).
      const availableStock = chosenVariant ? chosenVariant.stock : product.stock;
      if (
        (chosenVariant && !chosenVariant.active) ||
        (availableStock !== null && availableStock < item.quantity)
      ) {
        return NextResponse.json(
          {
            error: `A(z) "${item.name}" jelenleg nem elérhető a kért mennyiségben. Kérlek, frissítsd a kosarad.`,
          },
          { status: 400 }
        );
      }

      // Súlyarányos változat: csak engedélyezett, rendelhető párnánál, az aktuális
      // maximumig, a központi áron.
      const weighted = item.weighted === true;
      const offer = weighted ? weightedOffers[product.id] : null;
      if (weighted) {
        if (product.category !== 'pillow' || !offer) {
          return NextResponse.json(
            {
              error: `A(z) "${product.name}" méret- és súlyarányos változata jelenleg nem rendelhető. Kérlek, a kosárban válts a könnyű, méretarányos változatra.`,
            },
            { status: 409 },
          );
        }
        const weightError = checkWeightedWeight(item.birthWeight, offer.maxGrams);
        if (weightError) {
          return NextResponse.json({ error: `${product.name}: ${weightError}` }, { status: 400 });
        }
      }

      const basePrice = product.onSale && product.salePrice ? product.salePrice : product.price;
      const price = offer ? offer.price : isVariant ? item.price : basePrice + (chosenVariant?.priceDiff ?? 0);
      subtotal += price * item.quantity;

      verifiedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        // Párnánál a választott változat is a névben (Stripe, e-mail).
        name:
          product.category === 'pillow' && (weighted || product.weightedEnabled)
            ? pillowVariantName(product.name, weighted)
            : item.name || product.name,
        babyName: item.babyName || undefined,
        birthDate: item.birthDate || undefined,
        birthWeight: item.birthWeight || undefined,
        birthHeight: item.birthHeight || undefined,
        birthTime: item.birthTime || undefined,
        customNote: item.customNote || undefined,
        posterLayout: item.posterLayout || undefined,
        posterLayoutLabel: item.posterLayoutLabel || undefined,
        // A sürgősséget csak jogosult terméknél vesszük figyelembe — a kliens
        // által küldött jelzőt más terméknél figyelmen kívül hagyjuk.
        urgent: item.urgent === true && !weighted && isUrgentEligible(product.category),
        weighted,
        weightedStatus: offer?.status,
        productionNote: offer?.info,
        category: product.category,
        ships: cartItemRequiresShipping({
          slug: item.slug,
          variant: item.variant,
          category: product.category,
          noShipping: product.noShipping,
        }),
      });
    }

    // ── Sürgősségi elkészítés ─────────────────────────────────────────
    // A felárat mindig a szerver számolja a sürgős párnák darabszámából; a
    // kapcsoló kikapcsolt állapotában a sürgős tételt elutasítjuk.
    const urgentCount = verifiedItems.reduce((n, i) => n + (i.urgent ? i.quantity : 0), 0);
    if (urgentCount > 0 && !(await isUrgentEnabled())) {
      return NextResponse.json(
        {
          error:
            'A sürgősségi elkészítés jelenleg nem választható, mert a műhely szabad kapacitása betelt. Kérlek, a kosárban állítsd a párnákat normál elkészítésre.',
        },
        { status: 409 },
      );
    }
    const urgentFee = urgentFeeFor(urgentCount);
    const mixedUrgent = urgentCount > 0 && hasSlowerItems(verifiedItems);
    // A könnyű párna normál elkészítési ideje csak akkor kerül a visszaigazolásba,
    // ha van ilyen tétel; a súlyarányosnak saját tájékoztatója van.
    const hasPillow = verifiedItems.some((i) => i.category === 'pillow' && !i.weighted);
    const isPreorder = (i: { weighted: boolean; weightedStatus?: string }) => i.weighted && i.weightedStatus === 'preorder';
    const mixedPreorder =
      verifiedItems.some(isPreorder) && verifiedItems.some((i) => i.ships && !isPreorder(i));

    const baseShippingCost = orderRequiresShipping ? getShippingCost(country, effectiveMethod) : 0;

    // Apply coupon if provided
    let discount = 0;
    let freeShippingApplied = false;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          active: true,
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
        },
      });
      if (coupon) {
        if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
          if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
            if (coupon.discountType === 'percent') {
              discount = Math.round(subtotal * (coupon.discountValue / 100));
            } else {
              discount = coupon.discountValue;
            }
            if (discount > subtotal) discount = subtotal;

            // Free shipping modifier: domestic (HU) parcel only — never on the
            // Packeta cross-border destinations.
            if (
              coupon.freeShippingOnParcel &&
              country === 'HU' &&
              effectiveMethod === 'parcel' &&
              orderRequiresShipping
            ) {
              freeShippingApplied = true;
            }

            // Increment usage
            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usageCount: { increment: 1 } },
            });
          }
        }
      }
    }

    // Automatikus ingyenes csomagautomata 25 000 Ft felett — a kedvezmény utáni
    // termékérték + a sürgősségi felár számít, a szállítási díj nem. Sürgős
    // párnával határtól függetlenül ingyenes. Csak belföldi parcel módra.
    if (
      country === 'HU' &&
      effectiveMethod === 'parcel' &&
      orderRequiresShipping &&
      (urgentGrantsFreeParcel(urgentCount) || qualifiesForFreeParcel(subtotal - discount + urgentFee))
    ) {
      freeShippingApplied = true;
    }

    const shippingCost = freeShippingApplied ? 0 : baseShippingCost;

    // A kupon csak a termékekből von le; a felár mindig teljes összegben.
    const total = subtotal - discount + urgentFee + shippingCost;
    const shippingData = shippingResult.data;

    // Link to customer if logged in
    let customerId: string | null = null;
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const customer = await prisma.customer.findUnique({
        where: { email: session.user.email },
      });
      if (customer) customerId = customer.id;
    }

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        paymentMethod: payMethod,
        customerId,
        email: shippingData.email,
        phone: shippingData.phone || null,
        shippingName: shippingData.shippingName || 'Csomagautomata',
        shippingZip: shippingData.shippingZip || '',
        shippingCity: shippingData.shippingCity || '',
        shippingAddress: shippingData.shippingAddress || `Csomagautomata (${effectiveMethod})`,
        shippingNote: shippingData.shippingNote || null,
        billingZip: shippingData.billingZip || null,
        billingCity: shippingData.billingCity || null,
        billingAddress: shippingData.billingAddress || null,
        billingCountry: shippingData.billingCountry || 'HU',
        shippingCountry: country,
        shippingCarrier: carrier,
        pickupPointId: pickupPointId || null,
        subtotal,
        shippingCost,
        total,
        discount,
        urgentFee,
        // Szerződő és számlázó eladó a rendelés leadásakor.
        sellerId: (await getActiveSeller()).id,
        couponCode: discount > 0 || freeShippingApplied ? couponCode || null : null,
        items: {
          create: verifiedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            babyName: item.babyName || null,
            birthDate: item.birthDate || null,
            birthWeight: item.birthWeight || null,
            birthHeight: item.birthHeight || null,
            birthTime: item.birthTime || null,
            customNote: item.customNote || null,
            posterLayout: item.posterLayout || null,
            urgent: item.urgent,
            weighted: item.weighted,
            weightedStatus: item.weightedStatus ?? null,
            productionNote: item.productionNote ?? null,
          })),
        },
      },
    });

    // Save data: upsert customer (auto-register if new, update if existing)
    if (saveData || customerId) {
      const customerData = {
        name: shippingData.shippingName,
        phone: shippingData.phone || null,
        shippingName: shippingData.shippingName,
        shippingZip: shippingData.shippingZip || null,
        shippingCity: shippingData.shippingCity || null,
        shippingAddress: shippingData.shippingAddress || null,
        shippingNote: shippingData.shippingNote || null,
        billingZip: shippingData.billingZip || null,
        billingCity: shippingData.billingCity || null,
        billingAddress: shippingData.billingAddress || null,
      };

      const upsertedCustomer = await prisma.customer.upsert({
        where: { email: shippingData.email },
        update: customerData,
        create: { email: shippingData.email, ...customerData },
      });

      // Link order to customer if not already linked
      if (!customerId) {
        await prisma.order.update({
          where: { id: order.id },
          data: { customerId: upsertedCustomer.id },
        });
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';

    const hasGiftCard = verifiedItems.some(
      (item) => productMap.get(item.productId)?.category === 'giftcard',
    );

    const emailItems = verifiedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      babyName: item.babyName ?? null,
      posterLayoutLabel: item.posterLayoutLabel ?? null,
      urgent: item.urgent,
      pillow: item.category === 'pillow',
      weighted: item.weighted,
      weightedStatus: item.weightedStatus ?? null,
      productionNote: item.productionNote ?? null,
      birthWeight: item.birthWeight ?? null,
      birthHeight: item.birthHeight ?? null,
    }));

    // ── Zero-total flow (100% discount / free item): skip Stripe, mark paid. ──
    if (total === 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'paid' },
      });

      try {
        await applyStockForOrder(order.id);
      } catch (err) {
        console.error('Készletlevonás sikertelen:', { orderId: order.id, err });
      }

      // Digital gift cards: generate the coupon code(s) and email them.
      try {
        await fulfillGiftCardsForOrder(order.id);
      } catch (err) {
        console.error('Gift card fulfillment error:', err);
      }

      await sendOrderEmails({
        orderId: order.id,
        customerName: shippingData.shippingName || 'Vásárlónk',
        customerEmail: shippingData.email,
        phone: shippingData.phone,
        shippingMethod: orderRequiresShipping ? effectiveMethod : undefined,
        shippingAddress: orderRequiresShipping ? shippingData.shippingAddress : undefined,
        shippingZip: orderRequiresShipping ? shippingData.shippingZip : undefined,
        shippingCity: orderRequiresShipping ? shippingData.shippingCity : undefined,
        billingAddress: shippingData.billingAddress,
        billingZip: shippingData.billingZip,
        billingCity: shippingData.billingCity,
        paymentMethod: payMethod,
        items: emailItems,
        subtotal,
        shippingCost,
        discount,
        couponCode: discount > 0 || freeShippingApplied ? couponCode || null : null,
        urgentFee,
        mixedUrgent,
        mixedPreorder,
        hasPillow,
        total,
        hasGiftCard,
        hasInvoice: false,
        baseUrl,
      });

      notifyNewOrderTelegram(order.id).catch((err) =>
        console.error('Telegram notification error:', err)
      );

      return NextResponse.json({
        url: `${baseUrl}/koszonjuk?order_id=${order.id}&free=1`,
      });
    }

    // ── Bank transfer flow: skip Stripe, send confirmation emails immediately. ──
    if (payMethod === 'transfer') {
      await sendOrderEmails({
        orderId: order.id,
        customerName: shippingData.shippingName || 'Vásárlónk',
        customerEmail: shippingData.email,
        phone: shippingData.phone,
        shippingMethod: orderRequiresShipping ? effectiveMethod : undefined,
        shippingAddress: orderRequiresShipping ? shippingData.shippingAddress : undefined,
        shippingZip: orderRequiresShipping ? shippingData.shippingZip : undefined,
        shippingCity: orderRequiresShipping ? shippingData.shippingCity : undefined,
        billingAddress: shippingData.billingAddress,
        billingZip: shippingData.billingZip,
        billingCity: shippingData.billingCity,
        paymentMethod: 'transfer',
        items: emailItems,
        subtotal,
        shippingCost,
        discount,
        couponCode: discount > 0 || freeShippingApplied ? couponCode || null : null,
        urgentFee,
        mixedUrgent,
        mixedPreorder,
        hasPillow,
        total,
        hasGiftCard,
        hasInvoice: false,
        baseUrl,
      });

      notifyNewOrderTelegram(order.id).catch((err) =>
        console.error('Telegram notification error:', err)
      );

      return NextResponse.json({
        url: `${baseUrl}/koszonjuk?order_id=${order.id}&payment=transfer`,
      });
    }

    // ── Stripe Checkout Session ───────────────────────────────────────
    try {
      const lineItems = verifiedItems.map((item) => ({
        price_data: {
          currency: 'huf',
          product_data: {
            name: item.name,
            ...(item.babyName
              ? {
                  description: `${item.babyName}${item.birthDate ? ` · ${item.birthDate}` : ''}${
                    item.weighted ? ` · ${item.birthWeight ?? ''} g${item.weightedStatus === 'preorder' ? ' · Előrendelés' : ''}` : ''
                  }`,
                }
              : {}),
          },
          unit_amount: item.price * 100, // HUF is two-decimal in Stripe (1 Ft = 100)
        },
        quantity: item.quantity,
      }));

      // Sürgősségi elkészítés felára — külön tétel, nem szállítási díj.
      if (urgentFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'huf',
            product_data: { name: `${URGENT_LABEL} (${urgentCount} db emlékpárna)` },
            unit_amount: urgentFee * 100,
          },
          quantity: 1,
        });
      }

      // Add shipping as a line item (omit for digital-only or free-shipping orders)
      if (shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: 'huf',
            product_data: {
              name: effectiveMethod === 'parcel' ? 'Szállítás (Csomagautomata)' : 'Szállítás (Házhozszállítás)',
            },
            unit_amount: shippingCost * 100,
          },
          quantity: 1,
        });
      }

      // Stripe requires a minimum charge of 175 HUF. If the discounted total
      // would fall below that, fail with a clear message instead of Stripe's
      // generic rejection.
      if (total > 0 && total < 175) {
        return NextResponse.json(
          {
            error:
              'A rendelés végösszege a Stripe minimum limit alatt van (175 Ft). Kérjük, csökkentsd a kupon mértékét vagy rendelj több terméket.',
          },
          { status: 400 },
        );
      }

      // Add discount as a Stripe coupon
      const stripeDiscounts: { coupon: string }[] = [];
      if (discount > 0) {
        try {
          const stripeCoupon = await stripe.coupons.create({
            amount_off: discount * 100,
            currency: 'huf',
            duration: 'once',
            name: couponCode || 'Kedvezmény',
          });
          stripeDiscounts.push({ coupon: stripeCoupon.id });
        } catch (err) {
          console.error('Stripe coupon create failed:', err);
          return NextResponse.json(
            { error: 'Hiba történt a kupon beváltása során.' },
            { status: 500 },
          );
        }
      }

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        locale: 'hu',
        customer_email: shippingData.email,
        line_items: lineItems,
        ...(stripeDiscounts.length > 0 ? { discounts: stripeDiscounts } : {}),
        metadata: {
          orderId: order.id,
        },
        success_url: `${baseUrl}/koszonjuk?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${baseUrl}/penztar`,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentId: stripeSession.id },
      });

      return NextResponse.json({ url: stripeSession.url });
    } catch (err) {
      const stripeErr = err as { message?: string; type?: string; code?: string };
      console.error('Stripe session create failed:', {
        type: stripeErr.type,
        code: stripeErr.code,
        message: stripeErr.message,
        orderId: order.id,
        discount,
        shippingCost,
        total,
      });
      return NextResponse.json(
        { error: 'A fizetési kapcsolat létrehozása nem sikerült. Kérjük, próbáld újra.' },
        { status: 502 },
      );
    }
  } catch (error) {
    const e = error as { message?: string; name?: string; stack?: string };
    console.error('Checkout error:', { name: e.name, message: e.message, stack: e.stack });
    return NextResponse.json(
      { error: 'Hiba történt a rendelés rögzítése során.' },
      { status: 500 }
    );
  }
}
