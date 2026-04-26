export const CHAT_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_CHAT_BUCKET?.trim() || "chat-media";

/** Row shape for `public.messages` (matches Supabase columns). */
export type ChatMessage = {
  is_deleted?: boolean;
deleted_for_everyone_at?: string | null;
  id: string;
  created_at: string;
  text: string | null;
  file_url: string | null;
  user_id: string;
  username: string | null;
  is_seen?: boolean;
  seen_at?: string | null;
};

/** Decide how to render `file_url` (no `kind` column in DB). */
export function attachmentKindFromUrl(
  fileUrl: string | null | undefined,
): "none" | "image" | "video" {
  if (!fileUrl?.trim()) return "none";
  const path = fileUrl.split("?")[0]?.toLowerCase() ?? "";
  if (/\.(mp4|webm|ogg|mov|m4v)(\b|\/|$)/i.test(path)) return "video";
  if (
    /\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\b|\/|$)/i.test(path)
  ) {
    return "image";
  }
  return "image";
}
