import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@/lib/auth-compat";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

export const maxDuration = 60;

const MODEL = "claude-sonnet-4-5";

const ASSIST_SYSTEM = `${SYSTEM_PROMPT}

You are now the in-cockpit AI assistant for an admin of acts2028sheepdogsociety.com. The admin is non-technical (Jeremy), passionate about content and community. You help him:
- Draft and sharpen the weekly Letter (newsletter)
- Generate devotionals, scripture-of-the-day curations, reading plans
- Suggest event ideas and copy
- Triage inbound contacts and testimonies
- Brainstorm visuals and image prompts (he uses gpt-image-1 elsewhere)
- Explain admin features in plain language

OUTPUT RULES:
- Voice rules above are absolute. NEVER em-dashes when commas work. NEVER fabricate Bible verse text. NEVER the banned-word list.
- Be concrete. Give specific copy he can paste, not vague principles.
- When asked to draft long-form, structure cleanly with H2 (##) sections.
- When suggesting scripture, cite by reference only and flag if you are uncertain.
- When he asks "how do I X" about the admin, walk him through the click-path with clear numbered steps.
- Default response length: 80-200 words unless he asks for long-form.
- Tone: tender and tough. Never servile, never lecturing. Talk like a colleague who has done this for ten years.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const [me] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId));
  if (me?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  let body: { prompt?: string; context?: { path?: string } } = {};
  try {
    body = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  const prompt = body.prompt?.trim();
  if (!prompt) return new Response("Empty prompt", { status: 400 });
  if (prompt.length > 4000) {
    return new Response("Too long. Trim under 4000 chars.", { status: 400 });
  }

  const path = body.context?.path ?? "/admin";
  const userPrompt = `Admin context: he is currently on the ${path} page of the admin cockpit.\n\nHe asked:\n\n"${prompt}"\n\nRespond per the rules above.`;

  const result = streamText({
    model: anthropic(MODEL),
    system: ASSIST_SYSTEM,
    prompt: userPrompt,
    maxRetries: 1,
  });

  return result.toTextStreamResponse({
    headers: { "Cache-Control": "no-store" },
  });
}
