import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadsDir(): void {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureUploadsDir();

    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart Form Data
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate clean filename
      const rawExt = path.extname(file.name) || '.jpg';
      const ext = rawExt.toLowerCase().replace(/[^a-z0-9.]/g, '') || '.jpg';
      const cleanName = `ironash-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(UPLOADS_DIR, cleanName);

      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${cleanName}`,
        filename: cleanName,
      });
    }

    // Handle JSON Base64 data
    const body = await req.json();
    const { base64, filename } = body;

    if (!base64 || typeof base64 !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid image data' }, { status: 400 });
    }

    // Strip data URL prefix if present (e.g. data:image/jpeg;base64,...)
    const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = '.jpg';

    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      if (mimeType.includes('png')) ext = '.png';
      else if (mimeType.includes('webp')) ext = '.webp';
      else if (mimeType.includes('gif')) ext = '.gif';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64, 'base64');
    }

    const cleanName = filename
      ? `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      : `ironash-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    const filePath = path.join(UPLOADS_DIR, cleanName);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${cleanName}`,
      filename: cleanName,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
