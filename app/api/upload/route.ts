import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ADMIN_PASSWORD = 'yangtertampan';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const password = formData.get('password');
    const file = formData.get('file') as File | null;

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Bikin folder uploads di public/ jika belum ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nama file unik
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Simpan file
    fs.writeFileSync(filePath, buffer);

    // Kembalikan URL relatif
    const fileUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('Upload Error:', err);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
