"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";

export default function SecuritySessionWatch() {
  const signingOut = useRef(false);
  const filePickerOpen = useRef(false);
  const filePickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const goOffline = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles")
          .update({ is_online: false, last_seen_at: new Date().toISOString() })
          .eq("id", user.id);
      }
    };

    const hardLogout = async () => {
      if (signingOut.current) return;
      if (filePickerOpen.current) return;
      signingOut.current = true;
      await goOffline();
      await supabase.auth.signOut();
      window.location.replace("/login");
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        void hardLogout();
      } else {
        filePickerOpen.current = false;
        if (filePickerTimer.current) {
          clearTimeout(filePickerTimer.current);
          filePickerTimer.current = null;
        }
      }
    };

    const onPopState = () => { void hardLogout(); };

    const onFileInputClick = () => {
      filePickerOpen.current = true;
      signingOut.current = false;
      if (filePickerTimer.current) clearTimeout(filePickerTimer.current);
      filePickerTimer.current = setTimeout(() => {
        filePickerOpen.current = false;
      }, 30000);
    };

    const attachFileListeners = () => {
      document.querySelectorAll('input[type="file"]').forEach((el) => {
        el.removeEventListener("click", onFileInputClick);
        el.addEventListener("click", onFileInputClick);
      });
    };

    attachFileListeners();
    const observer = new MutationObserver(attachFileListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("popstate", onPopState);
      observer.disconnect();
      if (filePickerTimer.current) clearTimeout(filePickerTimer.current);
    };
  }, []);

  return null;
}