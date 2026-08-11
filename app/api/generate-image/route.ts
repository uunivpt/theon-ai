import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_SIZES = new Set(["1024x1024", "1536x1024", "1024x1536"]);
const MAX_PROMPT_LENGTH = 4000;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const prompt = body?.prompt;
    const size = typeof body?.size === "string" ? body.size : "1024x1024";
    const cleanPrompt = typeof prompt === "string" ? prompt.trim() : "";

    if (!cleanPrompt) {
      return NextResponse.json({ error: "Please enter an image prompt." }, { status: 400 });
    }
    if (cleanPrompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json({ error: "Image prompt is too long. Please keep it under 4,000 characters." }, { status: 413 });
    }
    if (!ALLOWED_SIZES.has(size)) {
      return NextResponse.json({ error: "Unsupported image size." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Image generation is not configured yet. Add OPENAI_API_KEY to Vercel Environment Variables." },
        { status: 503 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: "gpt-image-1", prompt: cleanPrompt, size }),
      signal: AbortSignal.timeout(60_000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Image generation failed." },
        { status: response.status >= 400 && response.status < 500 ? response.status : 502 },
      );
    }

    const image = data?.data?.[0];
    if (!image?.b64_json && !image?.url) {
      return NextResponse.json({ error: "The image service returned no image." }, { status: 502 });
    }

    return NextResponse.json({ image: image.b64_json ? `data:image/png;base64,${image.b64_json}` : image.url });
  } catch {
    return NextResponse.json({ error: "Unable to generate the image right now." }, { status: 500 });
  }
}
