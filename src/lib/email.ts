import { Resend } from "resend";
import { SANDBOX } from "./sandbox";

let _client: Resend | null = null;

/**
 * In the read-only sandbox we return a stub that swallows every send so no
 * email (transactional or Broadcast) can reach real subscribers, and callers
 * that expect a client don't throw. Shape-compatible with the paths we use.
 */
function sandboxResend(): Resend {
  const ok = async () => ({ data: { id: "sandbox-noop" }, error: null });
  return {
    emails: { send: ok, create: ok },
    batch: { send: ok, create: ok },
    broadcasts: { create: ok, send: ok, update: ok, remove: ok, get: ok, list: ok },
    contacts: { create: ok, update: ok, remove: ok, get: ok, list: ok },
    audiences: { create: ok, remove: ok, get: ok, list: ok },
  } as unknown as Resend;
}

export const EMAIL_TEST_REDIRECT =
  process.env.EMAIL_TEST_REDIRECT?.trim() || null;

/**
 * Pure: rewrite an outbound email payload so it can only reach the test address.
 * Every recipient collapses to `redirect`; the originals are preserved in the
 * subject prefix so a tester can see who it *would* have gone to.
 */
export function applyTestRedirect<T extends { to?: unknown; subject?: unknown }>(
  payload: T,
  redirect: string
): T & { to: string[]; subject: string } {
  const original = Array.isArray(payload.to)
    ? (payload.to as unknown[]).join(", ")
    : String(payload.to ?? "");
  const subject = typeof payload.subject === "string" ? payload.subject : "";
  return { ...payload, to: [redirect], subject: `[TEST→${original}] ${subject}` };
}

/**
 * Staging safety net: when EMAIL_TEST_REDIRECT is set, patch the live client so
 * every send lands only in the test inbox, and audience Broadcasts (which can't
 * be redirected) become no-ops. Env-gated — never active in production.
 */
function testRedirectResend(client: Resend, redirect: string): Resend {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const c = client as any;
  const origSend = c.emails.send.bind(c.emails);
  c.emails.send = (p: any, ...rest: any[]) =>
    origSend(applyTestRedirect(p, redirect), ...rest);
  const origBatch = c.batch.send.bind(c.batch);
  c.batch.send = (ps: any[], ...rest: any[]) =>
    origBatch(
      Array.isArray(ps) ? ps.map((p) => applyTestRedirect(p, redirect)) : ps,
      ...rest
    );
  const noop = async () => ({ data: { id: "test-redirect-noop" }, error: null });
  c.broadcasts.create = noop;
  c.broadcasts.send = noop;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return client;
}

export function resend(): Resend {
  if (SANDBOX) return sandboxResend();
  if (!_client) {
    const key = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY (or AUTH_RESEND_KEY) is not set");
    }
    _client = new Resend(key);
    if (EMAIL_TEST_REDIRECT) {
      _client = testRedirectResend(_client, EMAIL_TEST_REDIRECT);
    }
  }
  return _client;
}

export const FROM_AUTH =
  process.env.RESEND_FROM_AUTH ?? "auth@acts2028sheepdogsociety.com";
export const FROM_NEWSLETTER =
  process.env.RESEND_FROM_NEWSLETTER ??
  "letter@acts2028sheepdogsociety.com";
