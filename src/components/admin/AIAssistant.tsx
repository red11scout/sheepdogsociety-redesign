"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons/Icon";

interface Message {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

const QUICK_PROMPTS = [
  "Draft a 3-line theme for this week's letter.",
  "Suggest a scripture for a man feeling overwhelmed.",
  "Write a 60-word summary of Acts 20:28 for a non-Christian.",
  "Six headline options for a devotional on patience.",
  "Generate three event ideas for a quarterly gathering.",
];

export function AIAssistant({ open, onClose, initialPrompt }: AIAssistantProps) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 30);
    }
    if (!open) {
      abortRef.current?.abort();
    }
  }, [open]);

  useEffect(() => {
    if (initialPrompt && open) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt, open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !streaming) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, streaming, onClose]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "", pending: true }]);
    setPrompt("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/admin/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          context: { path: pathname ?? "/admin" },
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(await res.text().catch(() => "Failed"));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = {
            role: "assistant",
            content: acc,
            pending: true,
          };
          return next;
        });
      }
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: "assistant", content: acc };
        return next;
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: "assistant",
          content:
            "Something broke. Try again, or rephrase. If this keeps happening, check ANTHROPIC_API_KEY in Vercel.",
        };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(prompt);
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setPrompt("");
    setStreaming(false);
    textareaRef.current?.focus();
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-stone/15 bg-iron shadow-2xl transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-stone/15 px-6">
        <div className="flex items-center gap-3">
          <Icon name="sparkles" size={20} className="text-brass" />
          <div className="flex flex-col leading-tight">
            <span className="display-xl text-base text-bone">Ask Claude</span>
            <span className="section-mark text-[0.625rem] text-stone/55">
              On this page · {pathname}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="border border-stone/20 px-3 py-1.5 text-xs text-stone/65 transition-colors hover:border-brass hover:text-brass"
            >
              New chat
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-none p-2 text-stone/55 transition-colors hover:text-bone"
            aria-label="Close assistant"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="space-y-6">
            <div>
              <h3 className="display-xl text-2xl text-bone md:text-3xl">
                Sit down, brother.
              </h3>
              <p className="mt-3 font-pullquote text-base italic leading-relaxed text-stone">
                Tell me what you are working on. I will help you draft, sharpen,
                or generate. Always grounded in scripture. Always your voice.
              </p>
            </div>
            <div>
              <div className="section-mark text-stone/40">Try one</div>
              <div className="mt-3 flex flex-col gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="group flex items-start gap-3 border border-stone/15 bg-iron/40 px-4 py-3 text-left text-sm text-stone/80 transition-colors hover:border-brass/50 hover:text-bone"
                  >
                    <Icon
                      name="sparkles"
                      size={14}
                      className="mt-0.5 shrink-0 text-brass/70 group-hover:text-brass"
                    />
                    <span className="flex-1">{p}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "border-l-2 border-stone/30 pl-4"
                    : "border-l-2 border-brass pl-4"
                }
              >
                <div className="section-mark text-brass">
                  {m.role === "user" ? "You" : "Claude"}
                </div>
                <div className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-bone">
                  {m.content}
                  {m.pending && (
                    <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-brass align-middle" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-stone/15 bg-iron px-6 py-4"
      >
        <div className="border border-stone/20 bg-iron/40 transition-colors focus-within:border-brass">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e as unknown as FormEvent);
              }
            }}
            placeholder="What can I help with?"
            rows={3}
            disabled={streaming}
            className="block w-full resize-none bg-transparent px-4 py-3 text-sm text-bone placeholder:text-stone/40 focus:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between border-t border-stone/15 px-3 py-2">
            <span className="section-mark text-stone/40">⌘ + Enter</span>
            <button
              type="submit"
              disabled={!prompt.trim() || streaming}
              className="lift inline-flex h-8 items-center gap-2 bg-brass px-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {streaming ? "Thinking" : "Send"}
              {!streaming && <Icon name="send" size={12} />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
