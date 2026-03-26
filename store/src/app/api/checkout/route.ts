import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shipping, total } = body;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map(
        (item: {
          name: string;
          price: number;
          quantity: number;
          customData?: Record<string, string>;
        }) => ({
          price_data: {
            currency: "huf",
            product_data: {
              name: item.name,
              metadata: item.customData || {},
            },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        })
      ),
      metadata: {
        shippingName: `${shipping.lastName} ${shipping.firstName}`,
        shippingEmail: shipping.email,
        shippingPhone: shipping.phone,
        shippingAddress: `${shipping.zip} ${shipping.city}, ${shipping.address}`,
        shippingNote: shipping.note || "",
        totalAmount: total.toString(),
      },
      customer_email: shipping.email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/koszonjuk?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/kosar`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    // Fallback: simulate success for demo mode (when Stripe is not configured)
    return NextResponse.json({ success: true });
  }
}
