"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";

const SUGGESTIONS = [
  "I am drifting from my wife.",
  "I haven't prayed in months.",
  "What does Acts 20:28 ask of me?",
  "My anger is hurting my kids.",
  "I am tired and I do not know why.",
  "What scripture should I sit with this week?",
];

type Status = "idle" | "streaming" | "done" | "error" | "rate-limited";

export function AskTheWatch() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const responseRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || status === "streaming") return;

    setStatus("streaming");
    setResponse("");
    setErrorMsg("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/public/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
        signal: controller.signal,
      });

      if (res.status === 429) {
        setStatus("rate-limited");
        setErrorMsg(
          "Easy, brother. We have to slow down for a moment. Try again in a few minutes."
        );
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error(await res.text());
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setResponse(acc);
        responseRef.current?.scrollTo({
          top: responseRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatus("error");
      setErrorMsg("Something broke. Try again.");
    }
  }

  function reset() {
    abortRef.current?.abort();
    setPrompt("");
    setResponse("");
    setStatus("idle");
    setErrorMsg("");
    textareaRef.current?.focus();
  }

  function applySuggestion(s: string) {
    setPrompt(s);
    textareaRef.current?.focus();
  }

  const showResponse = status !== "idle" && (response || errorMsg);

  return (
    <div className="relative w-full">
      <form onSubmit={handleAsk} className="relative">
        <div
          className={`group relative border bg-card transition-colors ${
            status === "streaming"
              ? "border-brass"
              : "border-foreground/20 hover:border-foreground/40 focus-within:border-brass"
          }`}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAsk(e as unknown as FormEvent);
              }
            }}
            placeholder="Tell us what you are carrying."
            rows={3}
            maxLength={1200}
            disabled={status === "streaming"}
            className="block w-full resize-none bg-transparent px-6 py-5 font-serif text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50 md:px-8 md:py-6 md:text-xl"
          />
          <div className="flex items-center justify-between border-t border-foreground/10 px-6 py-3 md:px-8">
            <span className="folio">
              {status === "streaming" ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse bg-brass" />
                  Watching
                </span>
              ) : (
                <span>&#8984; + Enter to send</span>
              )}
            </span>
            <button
              type="submit"
              disabled={!prompt.trim() || status === "streaming"}
              className="lift inline-flex h-11 items-center gap-2 bg-foreground px-6 text-xs font-medium uppercase tracking-[0.18em] text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "streaming" ? "Listening" : "Ask"}
              {status !== "streaming" && <Icon name="arrow-right" size={14} />}
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions */}
      {status === "idle" && !prompt && (
        <div className="mt-6 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => applySuggestion(s)}
              className="min-h-[44px] border border-foreground/15 px-4 py-2 font-serif text-[0.95rem] text-muted-foreground transition-colors hover:border-brass/60 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Streaming response */}
      {showResponse && (
        <div className="mt-10 reveal is-visible">
          <div className="flex items-center gap-4">
            <span className="section-mark">A Brother Replies</span>
            <div className="hairline flex-1 text-foreground" />
            {status === "done" || status === "error" || status === "rate-limited" ? (
              <button
                type="button"
                onClick={reset}
                className="folio inline-flex min-h-[44px] items-center transition-colors hover:text-brass"
              >
                Ask again
              </button>
            ) : null}
          </div>
          <div
            ref={responseRef}
            className="mt-6 max-h-[420px] max-w-[68ch] overflow-y-auto pr-2 font-serif text-lg leading-[1.8] text-foreground/85 md:text-xl"
          >
            {errorMsg ? (
              <p className="font-serif italic text-muted-foreground">
                {errorMsg}
              </p>
            ) : (
              <div className="space-y-5 whitespace-pre-wrap">
                {response}
                {status === "streaming" && (
                  <span className="inline-block h-5 w-[3px] translate-y-1 animate-pulse bg-brass" />
                )}
              </div>
            )}
          </div>

          {status === "done" && (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/groups"
                className="lift group inline-flex h-12 items-center gap-2 bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Find a brother near you
                <Icon
                  name="arrow-right"
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/acts-20-28"
                className="lift inline-flex h-12 items-center gap-2 border border-foreground/70 px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                Read Acts 20:28
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
