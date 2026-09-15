import { NextRequest, NextResponse } from 'next/server';
import {
  getServerGoogleScriptUrl,
  setServerGoogleScriptUrl,
  validateAdminRequest,
} from '@/lib/server-admin';

export async function GET(req: NextRequest) {
  try {
    if (!validateAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const googleScriptUrl = getServerGoogleScriptUrl();
    return NextResponse.json({
      googleScriptUrl,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to retrieve configuration', details: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { googleScriptUrl } = body;

    if (typeof googleScriptUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid Google Script URL format' }, { status: 400 });
    }

    // Save permanently on the server
    setServerGoogleScriptUrl(googleScriptUrl);

    return NextResponse.json({
      success: true,
      message: 'Google Apps Script Web App URL saved permanently to server storage.',
      googleScriptUrl: googleScriptUrl.trim(),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save configuration', details: errorMessage }, { status: 500 });
  }
}
