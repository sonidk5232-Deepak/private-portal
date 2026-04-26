"use client";

import { usePortalTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = usePortalTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-3 py-1.5 text-sm font-medium text-[var(--portal-text)] shadow-sm transition hover:opacity-90"
      aria-label={
        theme === "dark" ? "Switch to golden theme" : "Switch to dark mode"
      }
    >
      {theme === "dark" ? (
        <>
          <Sun className="size-4 text-amber-400" aria-hidden />
          Golden
        </>
      ) : (
        <>
          <Moon className="size-4 text-zinc-300" aria-hidden />
          Dark
        </>
      )}
    </button>
  );
}
