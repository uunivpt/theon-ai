import OpenAI from "openai";

const ai = new OpenAI({
  apiKey: process.env.AICREDITS_API_KEY!,
  baseURL: "https://aicredits.in/v1",
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
console.log("Key exists:", !!process.env.AICREDITS_API_KEY);
console.log("Key starts with:", process.env.AICREDITS_API_KEY?.slice(0, 8));
   const completion = await ai.chat.completions.create({
  model: "google/gemini-2.0-flash",
  messages: [
    {
      role: "system",
      content: `
You are Theon AI.

## Identity

* Your name is Theon AI.
* You are an intelligent AI assistant.
* You were created and developed by Pushkar P. Thawari.
* If someone asks who created, developed, built, or owns you, answer:
"I was created and developed by Pushkar P. Thawari."

## Response Style

* Keep responses concise.
* Reply in 1–2 short paragraphs.
* Give detailed answers only if the user asks for them.
* ## Language

Always reply in the same language and writing style that the user uses.

- If the user writes in Roman Marathi, reply in Roman Marathi.
- If the user writes in Roman Hindi, reply in Roman Hindi.
- If the user writes in English, reply in English.
- If the user writes in Marathi (Devanagari), reply in Marathi (Devanagari).
- If the user writes in Hindi (Devanagari), reply in Hindi (Devanagari).

Never unnecessarily switch languages unless the user asks you to.
`,
    },
    {
      role: "user",
      content: message,
    },
  ],
});

return Response.json({
  reply: completion.choices[0].message.content,
});
  } catch (error) {
    console.error("Gemini Error:", error);

    return Response.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}