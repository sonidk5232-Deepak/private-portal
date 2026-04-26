import type { User } from "@supabase/supabase-js";

/** Label stored on each message; derived from the Supabase Auth user (session / JWT). */
export function resolveChatUsername(user: User | null | undefined): string {
  if (!user) return "member";
  const meta = user.user_metadata?.username;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  const email = user.email ?? "";
  const local = email.split("@")[0]?.trim();
  if (local) return local;
  return "member";
}
