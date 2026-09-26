import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

function sb(path: string, init: RequestInit = {}) {
  return fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SB_KEY || "",
      Authorization: `Bearer ${SB_KEY || ""}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

// strip C0 control chars + angle brackets, then cap length
function clean(v: unknown, max: number) {
  return String(v ?? "")
    .trim()
    .replace(/[\u0000-\u001f<>]/g, "")
    .slice(0, max);
}

// GET /api/guestbook -> { items: [...] } (newest first). items:[] on any db error so the client falls back.
export async function GET() {
  if (!SB_URL || !SB_KEY) return Response.json({ items: [], error: "no-db" });
  try {
    const r = await sb(
      "guestbook?select=id,name,pet,message,created_at&order=created_at.desc&limit=100"
    );
    if (!r.ok) return Response.json({ items: [], error: "db", status: r.status });
    const items = await r.json();
    return Response.json({ items });
  } catch {
    return Response.json({ items: [], error: "fetch" });
  }
}

// POST /api/guestbook { name, pet, message } -> { item } | { error }
export async function POST(req: NextRequest) {
  if (!SB_URL || !SB_KEY) return Response.json({ error: "no-db" }, { status: 200 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = clean(b.name, 40);
  const message = clean(b.message, 280);
  const pet = String(b.pet ?? "").trim().replace(/[^a-z0-9_-]/gi, "").slice(0, 32);
  if (!name || !message || !pet) return Response.json({ error: "missing" }, { status: 400 });
  try {
    const r = await sb("guestbook", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ name, pet, message }),
    });
    if (!r.ok) {
      const detail = await r.text();
      return Response.json({ error: "db", detail }, { status: 200 });
    }
    const rows = await r.json();
    return Response.json({ item: rows[0] });
  } catch {
    return Response.json({ error: "fetch" }, { status: 200 });
  }
}
