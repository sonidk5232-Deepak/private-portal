import type { ChatMessage } from "@/lib/chat";

/** Local calendar day key `YYYY-M-D` for grouping. */
export function calendarDayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** "Today" | "Yesterday" | "April 12, 2026" in local time. */
export function formatDateSeparatorLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const today = startOfLocalDay(now);
  const msgDay = startOfLocalDay(d);
  const diffDays = Math.round(
    (today.getTime() - msgDay.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(d);
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** e.g. 10:30 PM */
export function formatMessageTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

const MS_DAY = 24 * 60 * 60 * 1000;

export function isMessageWithinDeleteWindow(
  createdAtIso: string,
  now = new Date(),
): boolean {
  const created = new Date(createdAtIso).getTime();
  return now.getTime() - created < MS_DAY;
}

/** Same local calendar day as `now` (for "Delete for everyone" today-only rule). */
export function isMessageSentTodayLocal(
  createdAtIso: string,
  now = new Date(),
): boolean {
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  return calendarDayKey(createdAtIso) === todayKey;
}

/** Short label for header / roster. */
export function formatLastSeenLabel(
  iso: string | null | undefined,
  now = new Date(),
): string {
  if (!iso) return "no activity yet";
  const t = new Date(iso).getTime();
  const diff = now.getTime() - t;
  if (diff < 45_000) return "active now";
  if (diff < 3600_000) return `last seen ${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (diff < MS_DAY) return `last seen ${Math.floor(diff / 3600_000)}h ago`;
  const sameYear = new Date(iso).getFullYear() === now.getFullYear();
  return (
    "last seen " +
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso))
  );
}

export type TimelineItem =
  | { kind: "date"; key: string; label: string }
  | { kind: "message"; key: string; message: ChatMessage };

export function buildMessageTimeline(messages: ChatMessage[]): TimelineItem[] {
  const sorted = [...messages].sort(
    (a, b) =>
      new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf(),
  );
  const out: TimelineItem[] = [];
  let lastDay: string | null = null;
  for (const m of sorted) {
    const day = calendarDayKey(m.created_at);
    if (day !== lastDay) {
      out.push({
        kind: "date",
        key: `date-${day}`,
        label: formatDateSeparatorLabel(m.created_at),
      });
      lastDay = day;
    }
    out.push({ kind: "message", key: m.id, message: m });
  }
  return out;
}
