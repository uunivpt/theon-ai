import { NextResponse } from "next/server";
import { AuthError, requireFirebaseUser } from "@/lib/server-auth";

export const runtime = "nodejs";

const ALLOWED_SIZES = new Set(["1024x1024", "1536x1024", "1024x1536"]);
const MAX_PROMPT_LENGTH = 4_000;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    await requireFirebaseUser(request);
    const body = await request.json().catch(() => null);
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const size = typeof body?.size === "string" ? body.size : "1024x1024";

    if (!prompt) return error("Please enter an image prompt.", 400);
    if (prompt.length > MAX_PROMPT_LENGTH) return error("Image prompt is too long.", 413);
    if (!ALLOWED_SIZES.has(size)) return error("Unsupported image size.", 400);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return error("Image generation is not configured yet.", 503);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size }),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) return error("Image generation failed. Please try again.", response.status >= 400 && response.status < 500 ? response.status : 502);

    const image = data?.data?.[0];
    if (!image?.b64_json && !image?.url) return error("The image service returned no image.", 502);
    return NextResponse.json({ image: image.b64_json ? `data:image/png;base64,${image.b64_json}` : image.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    if (cause instanceof AuthError) return error(cause.message, cause.status);
    console.error("Theon image generation failed", cause);
    return error("Unable to generate the image right now.", 500);
  }
}
