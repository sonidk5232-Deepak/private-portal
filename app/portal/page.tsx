import ChatRoom from "@/components/ChatRoom";
import { resolveChatUsername } from "@/lib/resolve-chat-username";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ChatRoom
      userId={user.id}
      userEmail={user.email ?? ""}
      username={resolveChatUsername(user)}
    />
  );
}
