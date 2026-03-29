import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const { status, trackingNumber } = body as {
    status?: string;
    trackingNumber?: string;
  };

  const data: Record<string, string> = {};
  if (status) data.status = status;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'No fields to update' },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
}
