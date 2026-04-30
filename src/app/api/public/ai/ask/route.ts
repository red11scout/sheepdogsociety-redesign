import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

export const maxDuration = 30;

const MODEL = "claude-sonnet-4-5";

const ASK_SYSTEM = `${SYSTEM_PROMPT}

YOU ARE NOW IN CONVERSATION with a man who has come to acts2028sheepdogsociety.com. He is typing into a single textarea on the homepage. He may type a single word, a question, a confession, or a vague feeling. Read between his lines.

OUTPUT RULES (hard limits):
- Address him as "Brother." Once at the start. Not again.
- 80 to 140 words. Never longer.
- Two short paragraphs maximum.
- Lead with empathy and recognition, not advice.
- Anchor in one Scripture by reference (book chapter:verse). NEVER write the verse text yourself. Use the format: "Sit with Romans 5:3-4 this week." The system will resolve the text. If you are uncertain a verse exists, say "I'm not sure of the exact passage" rather than invent.
- One concrete pastoral move at the end. A small thing he can do today.
- Plain Anglo-Saxon. No Latinate clutter. No Christianese ("walking with God", "doing life together", "the journey of faith"). Voice is a 50-year-old elder who works with his hands.
- NEVER em-dashes when commas work.
- NEVER claim to speak for God. Never roleplay as Jesus. You are a brother pointing to Christ, not Christ.
- If he describes harm to himself or others, suicidal thoughts, abuse, or crisis: hold the moment, then say "Brother, this is bigger than this conversation. Call 988 now or text a man you trust." Then stop.
- If he is mocking the site or testing you, respond with warmth, not defense. Two sentences.

CALIBRATION: Tender and tough. Specifics over slogans. Short, soulful, true. Never feel like a chatbot. Feel like a man across a diner table at 6am who has been in this fight a long time.`;

const SUGGESTIONS_FALLBACK = "Tell me what is weighing on you today.";

const ipBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 8;

function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      retryAfter: Math.max(0, Math.floor((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return new Response(
      `Rate limit hit. Try again in ${limit.retryAfter}s.`,
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: { prompt?: string } = {};
  try {
    body = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  const prompt = body.prompt?.trim();
  if (!prompt || prompt.length < 2) {
    return new Response("Empty prompt", { status: 400 });
  }
  if (prompt.length > 1200) {
    return new Response("Prompt too long. Keep it under 1200 characters.", {
      status: 400,
    });
  }

  const userPrompt = `A man typed this into the site:\n\n"${prompt}"\n\nRespond per the rules above.${
    prompt.length < 4 ? `\n\n(He typed something very short. ${SUGGESTIONS_FALLBACK})` : ""
  }`;

  const result = streamText({
    model: anthropic(MODEL),
    system: ASK_SYSTEM,
    prompt: userPrompt,
    maxRetries: 1,
  });

  return result.toTextStreamResponse({
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
