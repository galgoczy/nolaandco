import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo; replace with database in production
const subscribers: { email: string; name?: string; date: string }[] = [];

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Érvénytelen email cím" },
        { status: 400 }
      );
    }

    const existing = subscribers.find((s) => s.email === email);
    if (existing) {
      return NextResponse.json(
        { error: "Már feliratkozott" },
        { status: 409 }
      );
    }

    subscribers.push({
      email,
      name,
      date: new Date().toISOString(),
    });

    // TODO: Store in database with Prisma
    // TODO: Send welcome email
    // TODO: Add to email marketing service

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Szerver hiba" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Admin endpoint to list subscribers
  return NextResponse.json({ subscribers, total: subscribers.length });
}
