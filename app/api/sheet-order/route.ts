import { NextRequest, NextResponse } from 'next/server';
import { getServerGoogleScriptUrl, addServerOrder, getServerContactInfo, getServerEmailConfig } from '@/lib/server-admin';
import { sendOrderEmails } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webAppUrl, orderData } = body;

    if (!orderData) {
      return NextResponse.json({ error: 'Missing orderData' }, { status: 400 });
    }

    // Sanitize and ensure numeric totalPrice so Google Sheets never receives NaN
    let cleanPrice = 0;
    if (typeof orderData.totalPrice === 'number') {
      cleanPrice = isNaN(orderData.totalPrice) ? 0 : orderData.totalPrice;
    } else if (typeof orderData.totalPrice === 'string') {
      const sanitized = orderData.totalPrice.replace(/[^0-9.]/g, '');
      cleanPrice = parseFloat(sanitized) || 0;
    }

    const customerEmail = (orderData.email || orderData.customerEmail || '').trim();

    const contactInfo = getServerContactInfo();
    const emailConfig = getServerEmailConfig();

    const payloadToSend = {
      ...orderData,
      id: orderData.id || orderData.orderId || `ASH-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: orderData.orderId || orderData.id,
      customerName: orderData.customerName || orderData.fullName || orderData.name || 'Valued Customer',
      fullName: orderData.fullName || orderData.customerName || orderData.name || 'Valued Customer',
      address: orderData.address || orderData.deliveryAddress || 'Address Not Provided',
      deliveryAddress: orderData.deliveryAddress || orderData.address || 'Address Not Provided',
      phone: orderData.phone || orderData.phoneNumber || '',
      email: customerEmail,
      createdAt: orderData.createdAt || new Date().toISOString(),
      totalPrice: cleanPrice,
      displayPrice: `PKR ${cleanPrice.toLocaleString()}`,
      adminNotificationEmail: emailConfig.adminNotificationEmail,
      notifyAdmin: emailConfig.notifyAdminOnNewOrder,
      notifyCustomer: emailConfig.notifyCustomerOnNewOrder,
    };

    // Persist order on server storage
    addServerOrder(payloadToSend);

    // Send email notifications (Customer receipt + Admin new order notification)
    let emailStatus = { customerSent: false, adminSent: false, errors: [] as string[] };
    try {
      emailStatus = await sendOrderEmails(
        {
          id: payloadToSend.id,
          orderId: payloadToSend.orderId,
          customerName: payloadToSend.customerName,
          phone: payloadToSend.phone,
          email: customerEmail,
          address: payloadToSend.address,
          notes: payloadToSend.notes,
          items: Array.isArray(payloadToSend.items) ? payloadToSend.items : [],
          totalPrice: payloadToSend.totalPrice,
          paymentMethod: payloadToSend.paymentMethod || 'Cash on Delivery',
          createdAt: payloadToSend.createdAt,
        },
        contactInfo,
        emailConfig
      );
    } catch (err: unknown) {
      console.warn('Order email dispatch warning:', err);
      emailStatus.errors.push(err instanceof Error ? err.message : 'Email dispatch exception');
    }

    // Resolve the Google Apps Script Web App URL:
    // 1. Explicitly provided in body (e.g. testing)
    // 2. Server-side configured URL saved by Admin in /data/admin-config.json
    // 3. Optional environment variable GOOGLE_SCRIPT_URL
    const serverUrl = getServerGoogleScriptUrl();
    const activeUrl =
      (typeof webAppUrl === 'string' && webAppUrl.startsWith('http') ? webAppUrl.trim() : '') ||
      (serverUrl && serverUrl.startsWith('http') ? serverUrl.trim() : '') ||
      (process.env.GOOGLE_SCRIPT_URL && process.env.GOOGLE_SCRIPT_URL.startsWith('http')
        ? process.env.GOOGLE_SCRIPT_URL.trim()
        : '');

    // If a Google Apps Script Web App URL is available, forward the request server-to-server
    if (activeUrl) {
      try {
        const response = await fetch(activeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadToSend),
          redirect: 'follow',
        });

        const text = await response.text();
        let parsedData;
        try {
          parsedData = JSON.parse(text);
        } catch {
          parsedData = { raw: text };
        }

        return NextResponse.json({
          success: true,
          forwardedToSheet: true,
          googleResponse: parsedData,
          orderId: orderData.orderId,
          emailStatus,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.warn('Google Sheet forward warning:', errorMessage);
        return NextResponse.json({
          success: true,
          forwardedToSheet: false,
          warning: `Failed to forward to Google Sheet: ${errorMessage}. Saved locally and on server.`,
          orderId: orderData.orderId,
          emailStatus,
        });
      }
    }

    // If no Google Sheet URL is set yet, return success (order was saved on server)
    return NextResponse.json({
      success: true,
      forwardedToSheet: false,
      message: 'Order saved to server. Configure your Google Apps Script Web App URL in /admin to sync rows.',
      orderId: orderData.orderId,
      emailStatus,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process order', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const webAppUrl =
    searchParams.get('url') ||
    getServerGoogleScriptUrl() ||
    process.env.GOOGLE_SCRIPT_URL ||
    '';

  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return NextResponse.json(
      { status: 'error', message: 'No valid Google Apps Script Web App URL configured on server' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(webAppUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      redirect: 'follow',
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { status: 'error', message: `Failed to fetch from Google Sheet: ${errorMessage}` },
      { status: 500 }
    );
  }
}
