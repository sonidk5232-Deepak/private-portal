"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";

/**
 * Logs the user out when the tab is hidden (tab switch / minimize),
 * or when the browser Back button is used (popstate).
 */
export default function SecuritySessionWatch() {
  const signingOut = useRef(false);

  useEffect(() => {
    const hardLogout = async () => {
      if (signingOut.current) return;
      signingOut.current = true;
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.replace("/login");
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        void hardLogout();
      }
    };

    const onPopState = () => {
      void hardLogout();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
}
