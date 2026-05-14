import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ADMIN_USERNAME = 'lifkie tampan';
const ADMIN_PASSWORD = 'yangtertampan';

const DATA_DIR = path.join(process.cwd(), 'data');

function getFilePath(section: string): string | null {
  const allowed = ['about', 'projects', 'skills', 'certificates'];
  if (!allowed.includes(section)) return null;
  return path.join(DATA_DIR, `${section}.json`);
}

// GET /api/cms?section=about|projects|skills
export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section');
  if (!section) {
    return NextResponse.json({ error: 'Missing section parameter' }, { status: 400 });
  }

  const filePath = getFilePath(section);
  if (!filePath) {
    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

// POST /api/cms
// Body: { password, section, data } OR { password, action: "verify" }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, section, data, action, username } = body;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If just verifying password, return success without writing
    if (action === 'verify') {
      return NextResponse.json({ success: true });
    }

    if (!section || data === null || data === undefined) {
      return NextResponse.json({ error: 'Missing section or data' }, { status: 400 });
    }

    const filePath = getFilePath(section);
    if (!filePath) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
