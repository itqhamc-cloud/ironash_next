import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerBrandingConfig, setServerBrandingConfig, validateAdminRequest } from '@/lib/server-admin';
import { DEFAULT_BRANDING_CONFIG } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const branding = getServerBrandingConfig();
    return NextResponse.json(
      {
        success: true,
        branding: branding || DEFAULT_BRANDING_CONFIG,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: true,
        branding: DEFAULT_BRANDING_CONFIG,
      },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await req.json();
    const updated = setServerBrandingConfig(body);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/api/branding');
      revalidateTag('branding');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json(
      { success: true, branding: updated },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
