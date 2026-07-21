import { describe, it, expect } from "vitest";
import { applyTestRedirect } from "@/lib/email";

describe("applyTestRedirect (staging email safety)", () => {
  it("collapses every recipient to the test address and tags the subject", () => {
    const out = applyTestRedirect(
      { to: ["a@x.com", "b@x.com"], subject: "The Letter", html: "<p>hi</p>" },
      "me@test.com"
    );
    expect(out.to).toEqual(["me@test.com"]);
    expect(out.subject).toBe("[TEST→a@x.com, b@x.com] The Letter");
    // unrelated fields are preserved
    expect((out as { html?: string }).html).toBe("<p>hi</p>");
  });

  it("handles a single string recipient", () => {
    const out = applyTestRedirect(
      { to: "one@x.com", subject: "Hi" },
      "me@test.com"
    );
    expect(out.to).toEqual(["me@test.com"]);
    expect(out.subject).toBe("[TEST→one@x.com] Hi");
  });

  it("tolerates missing to/subject without throwing", () => {
    const out = applyTestRedirect({}, "me@test.com");
    expect(out.to).toEqual(["me@test.com"]);
    expect(out.subject).toBe("[TEST→] ");
  });
});
