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

export function resend(): Resend {
  if (SANDBOX) return sandboxResend();
  if (!_client) {
    const key = process.env.RESEND_API_KEY ?? process.env.AUTH_RESEND_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY (or AUTH_RESEND_KEY) is not set");
    }
    _client = new Resend(key);
  }
  return _client;
}

export const FROM_AUTH =
  process.env.RESEND_FROM_AUTH ?? "auth@acts2028sheepdogsociety.com";
export const FROM_NEWSLETTER =
  process.env.RESEND_FROM_NEWSLETTER ??
  "letter@acts2028sheepdogsociety.com";
