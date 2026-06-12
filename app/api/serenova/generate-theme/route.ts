import { generateTheme } from "@/lib/serenova/generateTheme";
import { rateLimit } from "@/lib/serenova/rateLimit";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt;
    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limit = process.env.NODE_ENV === "production" ? 10 : 100;
    const { allowed, retryAfter } = rateLimit(`generate_theme:${ip}`, limit, 3600_000);

    if (!allowed) {
      return Response.json(
        { error: "Too many theme generations. Try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const { tokens, css } = await generateTheme(prompt);

    const nanoid = Math.random().toString(36).substring(2, 8);
    const timestamp = Date.now();
    const filename = `${timestamp}_${tokens.slug}_${nanoid}.css`;

    // Save to /tmp/generated-themes in prod, or project root in dev
    const baseDir = process.env.NODE_ENV === "production" ? "/tmp/generated-themes" : path.join(process.cwd(), "generated-themes");

    try {
      await fs.mkdir(baseDir, { recursive: true });
      await fs.writeFile(path.join(baseDir, filename), css, "utf-8");

      const metadataPath = path.join(baseDir, "metadata.json");
      let metadata = [];
      try {
        const existing = await fs.readFile(metadataPath, "utf-8");
        metadata = JSON.parse(existing);
      } catch {
        // file might not exist, ignore
      }

      metadata.push({
        id: nanoid,
        prompt,
        slug: tokens.slug,
        mood: tokens.mood,
        filename,
        generatedAt: new Date(timestamp).toISOString(),
        colors: tokens.colors
      });

      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
    } catch (err) {
      console.error("[Serenova API] Failed to write generated theme to disk:", err);
      // Don't crash, let client receive css
    }

    return Response.json({
      css,
      filename,
      themeName: tokens.name,
      mood: tokens.mood
    });
  } catch (error: any) {
    console.error("[Serenova API] Generate Theme Error:", error.message);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
