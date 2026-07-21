import { describe, it, expect } from "vitest";
import {
  signSubscriberToken,
  verifySubscriberToken,
  dedupeRecipients,
  chunk,
  personalize,
  type Recipient,
} from "@/server/audience-tokens";

const rcpt = (email: string, name = ""): Recipient => ({
  email,
  name,
  unsubscribeUrl: `https://x/unsub?e=${email}`,
});

describe("subscriber unsubscribe tokens", () => {
  it("verifies a token it signed (case/space-insensitive on email)", () => {
    const sig = signSubscriberToken("  Pete@Example.com ");
    expect(verifySubscriberToken("pete@example.com", sig)).toBe(true);
  });
  it("rejects a wrong or empty signature", () => {
    const sig = signSubscriberToken("pete@example.com");
    expect(verifySubscriberToken("someone@else.com", sig)).toBe(false);
    expect(verifySubscriberToken("pete@example.com", "")).toBe(false);
    expect(verifySubscriberToken("pete@example.com", "deadbeef")).toBe(false);
  });
});

describe("dedupeRecipients", () => {
  it("keeps the first (member) record on a case-insensitive email collision", () => {
    const members = [rcpt("A@X.com", "Member Al")];
    const subs = [rcpt("a@x.com", "Sub Al"), rcpt("bob@x.com", "Bob")];
    const out = dedupeRecipients(members, subs);
    expect(out).toHaveLength(2);
    expect(out.find((r) => r.email.toLowerCase() === "a@x.com")?.name).toBe(
      "Member Al"
    );
  });
  it("drops blank emails", () => {
    expect(dedupeRecipients([rcpt(""), rcpt("  ")])).toHaveLength(0);
  });
});

describe("chunk + personalize", () => {
  it("chunks into batches", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it("substitutes unsubscribe url and name (fallback 'brother')", () => {
    const r = { email: "x@x.com", name: "", unsubscribeUrl: "https://u/1" };
    const out = personalize("Hi {{NAME}} — {{UNSUBSCRIBE_URL}}", r);
    expect(out).toBe("Hi brother — https://u/1");
  });
});
