import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPassword,
  createSession,
  validateAdminRequest,
  invalidateSession,
  isRateLimited,
  recordLoginAttempt,
} from '@/lib/server-admin';

export async function POST(req: NextRequest) {
  try {
    const { limited, retryAfterSeconds } = isRateLimited();
    if (limited) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please try again in ${retryAfterSeconds} seconds.`,
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const isValid = verifyPassword(password.trim());

    if (!isValid) {
      recordLoginAttempt(false);
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // Reset failed counter and create session
    recordLoginAttempt(true);
    const token = createSession();

    const response = NextResponse.json({
      success: true,
      token,
      message: 'Authenticated successfully',
    });

    // Set HTTP-only session cookie (support cross-site iframes with sameSite: none; secure: true)
    response.cookies.set('ironash_admin_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const valid = validateAdminRequest(req);
    return NextResponse.json({ authenticated: valid });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token =
      req.cookies.get('ironash_admin_session')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (token) {
      invalidateSession(token);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.cookies.delete('ironash_admin_session');
    return response;
  } catch {
    return NextResponse.json({ success: true });
  }
}
