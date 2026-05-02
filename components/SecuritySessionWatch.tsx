"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";

export default function SecuritySessionWatch() {
  const signingOut      = useRef(false);
  const filePickerOpen  = useRef(false);
  const filePickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const blankPage = () => {
      (window as any).__loggedOut = true;
      document.body.style.visibility    = "hidden";
      document.body.style.pointerEvents = "none";
      const veil = document.createElement("div");
      veil.id = "__security_veil__";
      Object.assign(veil.style, {
        position: "fixed", inset: "0", background: "#000",
        zIndex: "999999", opacity: "1",
      });
      document.documentElement.appendChild(veil);
    };

    const clearHistoryAndRedirect = () => {
      const depth = window.history.length;
      for (let i = 0; i < depth; i++) {
        window.history.pushState(null, "", "about:blank");
      }
      window.history.replaceState(null, "", "about:blank");
      window.open("", "_self");
      window.close();
      setTimeout(() => {
        window.location.replace("about:blank");
        document.title = "";
        document.body.innerHTML = "";
      }, 100);
    };

    const hardLogout = async () => {
      if (signingOut.current)     return;
      if (filePickerOpen.current) return;

      signingOut.current = true;

      // 1. Turant page blank karo — kuch nazar na aaye
      blankPage();

      try {
        const supabase = createClient();

        // 2. Pehle user ko offline mark karo
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({
              is_online: false,
              last_seen_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        }

        // 3. Saare realtime channels band karo
        await supabase.removeAllChannels();

        // 4. Sign out karo
        await supabase.auth.signOut();

      } catch (_) {}

      // 5. Tab band + history saaf
      clearHistoryAndRedirect();
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

    const onPopState = () => void hardLogout();

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) void hardLogout();
    };

    const onFileInputClick = () => {
      filePickerOpen.current = true;
      signingOut.current     = false;
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
    window.addEventListener("pageshow", onPageShow as EventListener);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow as EventListener);
      observer.disconnect();
      if (filePickerTimer.current) clearTimeout(filePickerTimer.current);
    };
  }, []);

  return null;
}