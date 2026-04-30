"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { CommandPalette } from "./CommandPalette";
import { AIAssistant } from "./AIAssistant";

interface AdminShellProps {
  user: { id: string; name: string | null; email: string | null };
  pendingCount?: number;
  pendingTestimonies?: number;
  pendingLocationRequests?: number;
  children: React.ReactNode;
}

export function AdminShell({
  user,
  pendingCount,
  pendingTestimonies,
  pendingLocationRequests,
  children,
}: AdminShellProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [seedPrompt, setSeedPrompt] = useState<string | undefined>();

  // ⌘K to open palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "j" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        setAssistantOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-iron text-bone">
      <AdminSidebar
        pendingCount={pendingCount}
        pendingTestimonies={pendingTestimonies}
        pendingLocationRequests={pendingLocationRequests}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar
          user={user}
          onOpenCommand={() => setPaletteOpen(true)}
          onOpenAssistant={() => setAssistantOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-iron">{children}</main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAskAi={(p) => {
          setSeedPrompt(p);
          setAssistantOpen(true);
        }}
      />

      <AIAssistant
        open={assistantOpen}
        onClose={() => {
          setAssistantOpen(false);
          setSeedPrompt(undefined);
        }}
        initialPrompt={seedPrompt}
      />
    </div>
  );
}
