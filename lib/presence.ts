export type UserPresenceRow = {
  user_id: string;
  username: string | null;
  last_seen_at: string;
};

export const PRESENCE_COLUMNS = "user_id,username,last_seen_at" as const;
