import { NextRequest, NextResponse } from 'next/server';
import { getServerOrders, validateAdminRequest } from '@/lib/server-admin';

export async function GET(req: NextRequest) {
  try {
    if (!validateAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = getServerOrders();
    return NextResponse.json({ orders });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch orders', details: errorMessage }, { status: 500 });
  }
}
