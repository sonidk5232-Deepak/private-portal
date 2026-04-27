"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

function getEmailSuffix(): string {
  const raw = process.env.NEXT_PUBLIC_LOGIN_EMAIL_DOMAIN?.trim();
  if (!raw) return "@portal.local";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

/** Maps User ID to the synthetic email Supabase expects (e.g. deepak01 → deepak01@your.domain). */
function userIdToEmail(userId: string): string {
  const trimmed = userId.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("@")) return trimmed;
  return `${trimmed}${getEmailSuffix()}`;
}

export default function LoginForm() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const email = userIdToEmail(userId);

    try {
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signErr) throw signErr;
      window.location.replace("/portal");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--portal-border)] bg-[var(--portal-surface)] p-8 shadow-xl"
    >
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--portal-text)]">
          Private portal
        </h1>
        <p className="text-sm text-[var(--portal-muted)]">
          Sign in with your user ID and password.
        </p>
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--portal-muted)]">User ID</span>
        <input
          className="w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-elevated)] px-3 py-2 text-[var(--portal-text)] outline-none ring-emerald-500/40 focus:ring-2"
          type="text"
          inputMode="text"
          autoComplete="username"
          spellCheck={false}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder=""
          required
        />
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="text-[var(--portal-muted)]">Password</span>
        <input
          className="w-full rounded-lg border border-[var(--portal-border)] bg-[var(--portal-elevated)] px-3 py-2 text-[var(--portal-text)] outline-none ring-emerald-500/40 focus:ring-2"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Please wait…" : "Enter portal"}
      </button>

      <p className="text-center text-xs text-[var(--portal-muted)]">
        This session ends if you leave the tab, minimize the window, or use the
        browser Back button.
      </p>
    </form>
  );
}
