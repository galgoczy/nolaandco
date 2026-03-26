import { NextRequest, NextResponse } from "next/server";

export interface Order {
  id: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    customData?: Record<string, string>;
  }[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
    note?: string;
  };
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  stripeSessionId?: string;
  createdAt: string;
}

// In-memory store for demo
const orders: Order[] = [
  {
    id: "ORD-001",
    items: [
      {
        productId: "parna-angyalbaba",
        name: "Angyalbaba Párna",
        price: 14990,
        quantity: 1,
        customData: {
          babyName: "Kis Emma",
          birthDate: "2026-01-15",
          birthWeight: "3250 g",
          birthLength: "50 cm",
        },
      },
    ],
    shipping: {
      firstName: "Anna",
      lastName: "Kiss",
      email: "anna@pelda.hu",
      phone: "+36201234567",
      address: "Kossuth u. 12.",
      city: "Budapest",
      zip: "1054",
    },
    total: 16480,
    status: "processing",
    createdAt: "2026-03-24T10:30:00Z",
  },
  {
    id: "ORD-002",
    items: [
      {
        productId: "poszter-korababa",
        name: "Korababa Poszter",
        price: 7990,
        quantity: 2,
        customData: {
          babyName: "Nagy Bence",
          birthDate: "2026-02-20",
          birthWeight: "3800 g",
          birthLength: "52 cm",
        },
      },
    ],
    shipping: {
      firstName: "Péter",
      lastName: "Nagy",
      email: "peter@pelda.hu",
      phone: "+36301234567",
      address: "Petőfi tér 5.",
      city: "Szeged",
      zip: "6720",
    },
    total: 17470,
    status: "pending",
    createdAt: "2026-03-25T14:15:00Z",
  },
];

export async function GET() {
  return NextResponse.json({ orders });
}

export async function PATCH(request: NextRequest) {
  const { id, status } = await request.json();

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return NextResponse.json({ error: "Rendelés nem található" }, { status: 404 });
  }

  order.status = status;
  return NextResponse.json({ order });
}
