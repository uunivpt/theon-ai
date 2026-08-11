import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { prompt, size = "1024x1024" } = await request.json();
    const cleanPrompt = typeof prompt === "string" ? prompt.trim() : "";

    if (!cleanPrompt) {
      return NextResponse.json({ error: "Please enter an image prompt." }, { status: 400 });
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
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "Image generation failed." }, { status: response.status });
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
