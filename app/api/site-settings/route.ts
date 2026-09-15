import { NextResponse } from 'next/server';
import { getServerContactInfo, getServerEmailConfig, getServerGoogleScriptUrl } from '@/lib/server-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

// Public endpoint for storefront to fetch live contact info and support settings
export async function GET() {
  try {
    const contactInfo = getServerContactInfo();
    const emailConfig = getServerEmailConfig();
    const googleScriptUrl = getServerGoogleScriptUrl();

    return NextResponse.json(
      {
        success: true,
        contactInfo,
        emailNotifications: {
          customerEmailEnabled: emailConfig.notifyCustomerOnNewOrder,
          adminEmailConfigured: Boolean(emailConfig.adminNotificationEmail),
        },
        hasGoogleScriptUrl: Boolean(googleScriptUrl),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch site settings', details: msg },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
