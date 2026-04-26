import type { ChatMessage } from "@/lib/chat";

/**
 * Columns for `public.messages`.
 * - Message body: `text` (quoted for PostgREST reserved word).
 * - Media: full public URL in `file_url` (not a storage path / not `body` / not `media_path`).
 */
export const MESSAGES_COLUMNS =
  'id,created_at,user_id,username,"text",file_url,deleted_for_everyone_at,is_seen,seen_at' as const;

/** Append or replace-by-id, then sort by `created_at` (Realtime + insert-return can both fire). */
export function mergeIncomingChatMessage(
  prev: ChatMessage[],
  row: ChatMessage | null | undefined,
): ChatMessage[] {
  if (!row?.id) return prev;
  if (prev.some((m) => m.id === row.id)) return prev;
  return [...prev, row].sort(
    (a, b) =>
      new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf(),
  );
}

/** INSERT or full-row UPDATE from Realtime / after soft-delete. */
export function upsertChatMessageById(
  prev: ChatMessage[],
  row: ChatMessage | null | undefined,
): ChatMessage[] {
  if (!row?.id) return prev;
  const idx = prev.findIndex((m) => m.id === row.id);
  if (idx === -1) {
    return [...prev, row].sort(
      (a, b) =>
        new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf(),
    );
  }
  const next = [...prev];
  next[idx] = { ...next[idx], ...row };
  return next.sort(
    (a, b) =>
      new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf(),
  );
}

export function removeMessageById(
  prev: ChatMessage[],
  id: string | undefined,
): ChatMessage[] {
  if (!id) return prev;
  return prev.filter((m) => m.id !== id);
}

export function insertTextMessageRow(args: {
  userId: string;
  username: string;
  text: string;
}) {
  return {
    user_id: args.userId,
    username: args.username,
    text: args.text,
    file_url: null as string | null,
  };
}

export function insertFileMessageRow(args: {
  userId: string;
  username: string;
  text: string | null;
  file_url: string;
}) {
  return {
    user_id: args.userId,
    username: args.username,
    text: args.text,
    file_url: args.file_url,
  };
}
