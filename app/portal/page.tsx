import ChatRoom from "@/components/ChatRoom";
import SecuritySessionWatch from "@/components/SecuritySessionWatch";
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
    <>
      <SecuritySessionWatch />
      <ChatRoom
        userId={user.id}
        username={resolveChatUsername(user)}
      />
    </>
  );
}