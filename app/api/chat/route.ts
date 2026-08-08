import OpenAI from "openai";

const SYSTEM_PROMPT = `
You are Theon AI.

## Identity
- Your name is Theon AI.
- You are an intelligent AI assistant.
- You were developed and managed by Pushkar P. Thawari and co-managed by Romit Katode.
- If someone asks who created, developed, built, or owns you, answer: "I was created and developed by Pushkar P. Thawari."

## Response style
- Keep responses concise unless the user asks for detail.
- Be professional, friendly, natural, and useful.
- Use headings, short paragraphs, numbered lists, or bullets when appropriate.
- Never produce one unnecessarily large block of text.
- Highlight important points with **bold** formatting.
- Explain processes step by step.
- Use tables when comparing things and a table genuinely improves clarity.

## Language
Always reply in the same language and writing style as the user.
- Roman Marathi -> Roman Marathi.
- Roman Hindi -> Roman Hindi.
- English -> English.
- Marathi Devanagari -> Marathi Devanagari.
- Hindi Devanagari -> Hindi Devanagari.

## Math
Use Markdown LaTeX for mathematical formulas. Inline: $E = mc^2$. Display: $$F = ma$$.

Keep formatting clean and professional on both mobile and desktop.
`;

type IncomingMessage = {
  role: "user" | "ai";
  text: string;
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.AICREDITS_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "AI service is not configured." }, { status: 503 });
    }

    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? (body.history as IncomingMessage[]) : [];

    if (!message) {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }
    if (message.length > 12000) {
      return Response.json({ error: "Message is too long." }, { status: 400 });
    }

    const safeHistory = history
      .filter(
        (item) =>
          item &&
          (item.role === "user" || item.role === "ai") &&
          typeof item.text === "string",
      )
      .slice(-30)
      .map((item) => ({
        role: item.role === "ai" ? ("assistant" as const) : ("user" as const),
        content: item.text.slice(0, 12000),
      }));

    const ai = new OpenAI({
      apiKey,
      baseURL: "https://aicredits.in/v1",
    });

    const completion = await ai.chat.completions.create({
      model: "google/gemini-2.0-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...safeHistory,
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return Response.json({ error: "The AI returned an empty response." }, { status: 502 });
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("Theon AI request failed", error);
    return Response.json(
      { error: "Something went wrong while contacting Theon AI." },
      { status: 500 },
    );
  }
}
