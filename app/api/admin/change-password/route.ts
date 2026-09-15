import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPassword,
  updateAdminPassword,
  validateAdminRequest,
} from '@/lib/server-admin';

export async function POST(req: NextRequest) {
  try {
    if (!validateAdminRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'New password is required.' }, { status: 400 });
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long for security.' },
        { status: 400 }
      );
    }

    // Verify current password
    if (!verifyPassword(currentPassword.trim())) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    // Update password with salted PBKDF2 hash on the server
    updateAdminPassword(newPassword.trim());

    return NextResponse.json({
      success: true,
      message: 'Admin password updated and securely saved to server storage.',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update password', details: errorMessage }, { status: 500 });
  }
}
