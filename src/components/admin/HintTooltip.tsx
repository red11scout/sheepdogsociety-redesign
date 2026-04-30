"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";

interface HintTooltipProps {
  hint: string;
  className?: string;
}

export function HintTooltip({ hint, className }: HintTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center align-middle ${className ?? ""}`}
    >
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-label="Hint"
        className="text-stone/40 transition-colors hover:text-brass"
      >
        <Icon name="help" size={14} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 border border-stone/25 bg-iron px-3 py-2 text-xs leading-relaxed text-bone shadow-lg"
        >
          {hint}
        </span>
      )}
    </span>
  );
}
