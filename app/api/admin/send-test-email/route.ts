import { NextRequest, NextResponse } from 'next/server';
import { validateAdminRequest, getServerContactInfo, getServerEmailConfig } from '@/lib/server-admin';
import { sendTestEmail } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { targetEmail, customConfig } = body;

    const emailConfig = customConfig || getServerEmailConfig();
    const contactInfo = getServerContactInfo();

    const recipient = targetEmail || emailConfig.adminNotificationEmail;

    if (!recipient || !recipient.includes('@')) {
      return NextResponse.json({ error: 'Valid recipient email address is required' }, { status: 400 });
    }

    const result = await sendTestEmail(recipient, emailConfig, contactInfo);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to send test email', details: msg }, { status: 500 });
  }
}
