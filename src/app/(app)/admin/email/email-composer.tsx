"use client";

import { useEffect, useState, useTransition } from "react";
import {
  countBlastRecipients,
  sendBlast,
  type BlastAudience,
} from "@/server/broadcast";

type Group = { id: string; name: string };
type Blast = {
  id: string;
  subject: string;
  audienceType: string;
  recipientCount: number;
  status: string;
  createdAt: string;
};

export function EmailComposer({
  groups,
  recent,
}: {
  groups: Group[];
  recent: Blast[];
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState<
    "leaders" | "groups" | "everyone"
  >("everyone");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const groupKey = groupIds.join(",");

  function audience(): BlastAudience {
    if (audienceType === "leaders") return { type: "leaders" };
    if (audienceType === "groups") return { type: "groups", groupIds };
    return { type: "everyone" };
  }

  useEffect(() => {
    let cancelled = false;
    setCountLoading(true);
    countBlastRecipients(
      audienceType === "leaders"
        ? { type: "leaders" }
        : audienceType === "groups"
          ? { type: "groups", groupIds }
          : { type: "everyone" }
    )
      .then((n) => !cancelled && setCount(n))
      .catch(() => !cancelled && setCount(null))
      .finally(() => !cancelled && setCountLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceType, groupKey]);

  function toggleGroup(id: string) {
    setGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function doSend() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const r = await sendBlast({ subject, body, audience: audience() });
        setResult(
          `Sent to ${r.sent} of ${r.recipientCount}${
            r.failed ? `, ${r.failed} failed` : ""
          }.`
        );
        setConfirming(false);
        setSubject("");
        setBody("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Send failed");
        setConfirming(false);
      }
    });
  }

  const canSend =
    !!subject.trim() &&
    !!body.trim() &&
    (audienceType !== "groups" || groupIds.length > 0) &&
    (count ?? 0) > 0;

  const box = "w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm";

  return (
    <div className="mt-6 space-y-6">
      <div>
        <label className="text-sm font-medium">Who gets it</label>
        <div className="mt-2 space-y-2 text-sm">
          {(["everyone", "leaders", "groups"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2">
              <input
                type="radio"
                name="audience"
                checked={audienceType === t}
                onChange={() => setAudienceType(t)}
              />
              {t === "everyone"
                ? "Everyone (members + subscribers)"
                : t === "leaders"
                  ? "Group leaders"
                  : "Selected group(s)"}
            </label>
          ))}
        </div>
        {audienceType === "groups" && (
          <div className="mt-2 max-h-44 space-y-1 overflow-y-auto border border-foreground/15 p-3 text-sm">
            {groups.length === 0 && (
              <p className="text-muted-foreground">No groups yet.</p>
            )}
            {groups.map((g) => (
              <label key={g.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={groupIds.includes(g.id)}
                  onChange={() => toggleGroup(g.id)}
                />
                {g.name}
              </label>
            ))}
          </div>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {countLoading
            ? "Counting…"
            : count === null
              ? "—"
              : `${count} recipient${count === 1 ? "" : "s"}`}{" "}
          (people who unsubscribed are skipped)
        </p>
      </div>

      <div>
        <label htmlFor="blast-subject" className="text-sm font-medium">
          Subject
        </label>
        <input
          id="blast-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`mt-2 ${box}`}
        />
      </div>

      <div>
        <label htmlFor="blast-body" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="blast-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className={`mt-2 ${box}`}
          placeholder="Write plainly. A blank line starts a new paragraph."
        />
      </div>

      {!confirming ? (
        <button
          type="button"
          disabled={!canSend || isPending}
          onClick={() => setConfirming(true)}
          className="bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          Review &amp; send
        </button>
      ) : (
        <div className="border border-foreground/25 bg-foreground/[0.03] p-4">
          <p className="text-sm">
            Send &ldquo;<strong>{subject}</strong>&rdquo; to{" "}
            <strong>{count}</strong> recipient{count === 1 ? "" : "s"} from
            shepherd@acts2028sheepdogsociety.com?
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={doSend}
              className="bg-foreground px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              {isPending ? "Sending…" : "Send it"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirming(false)}
              className="border border-foreground/30 px-5 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && <p className="text-sm text-olive">{result}</p>}
      {error && (
        <p role="alert" className="text-sm text-oxblood">
          {error}
        </p>
      )}

      {recent.length > 0 && (
        <div className="border-t border-foreground/15 pt-5">
          <h2 className="text-sm font-medium">Recent sends</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {recent.map((b) => (
              <li key={b.id}>
                {new Date(b.createdAt).toLocaleDateString()} · {b.subject} ·{" "}
                {b.audienceType} · {b.recipientCount} · {b.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
