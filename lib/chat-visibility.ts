import type { ChatMessage } from "@/lib/chat";

/** Messages visible to this user (watermark + per-message hide). Tombstones stay if not hidden. */
export function filterMessagesForViewer(
  all: ChatMessage[],
  opts: {
    hideBeforeAt: string | null;
    hiddenMessageIds: Set<string>;
  },
): ChatMessage[] {
  return all.filter((m) => {
    if (opts.hiddenMessageIds.has(m.id)) return false;
    if (opts.hideBeforeAt && new Date(m.created_at) < new Date(opts.hideBeforeAt)) {
      return false;
    }
    return true;
  });
}
