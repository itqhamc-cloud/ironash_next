import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  validateAdminRequest,
  getServerContactInfo,
  setServerContactInfo,
  getServerEmailConfig,
  setServerEmailConfig,
  getServerBrandingConfig,
  setServerBrandingConfig,
} from '@/lib/server-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(req: NextRequest) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    const contactInfo = getServerContactInfo();
    const emailConfig = getServerEmailConfig();
    const brandingConfig = getServerBrandingConfig();

    return NextResponse.json(
      {
        success: true,
        contactInfo,
        emailConfig,
        brandingConfig,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to read settings', details: msg }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: NextRequest) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await req.json();
    const { contactInfo, emailConfig, brandingConfig } = body;

    let updatedContact = getServerContactInfo();
    let updatedEmail = getServerEmailConfig();
    let updatedBranding = getServerBrandingConfig();

    if (contactInfo && typeof contactInfo === 'object') {
      updatedContact = setServerContactInfo(contactInfo);
    }

    if (brandingConfig && typeof brandingConfig === 'object') {
      updatedBranding = setServerBrandingConfig(brandingConfig);
    }

    if (emailConfig && typeof emailConfig === 'object') {
      // If smtpPass is passed as empty or unchanged placeholder, keep existing password
      const currentEmail = getServerEmailConfig();
      const passToSave =
        emailConfig.smtpPass !== undefined && emailConfig.smtpPass !== ''
          ? emailConfig.smtpPass
          : currentEmail.smtpPass || '';

      updatedEmail = setServerEmailConfig({
        ...emailConfig,
        smtpPass: passToSave,
      });
    }

    // Immediately purge any cached versions of storefront pages and endpoints
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/api/branding');
      revalidatePath('/api/site-settings');
      revalidateTag('branding');
      revalidateTag('settings');
      revalidateTag('site-settings');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Settings saved successfully',
        contactInfo: updatedContact,
        emailConfig: updatedEmail,
        brandingConfig: updatedBranding,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update settings', details: msg }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
