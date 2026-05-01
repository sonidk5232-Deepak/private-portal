"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";

/**
 * Logs the user out when the tab is hidden (tab switch / minimize),
 * or when the browser Back button is used (popstate).
 *
 * Exception: file picker (gallery) open hone par logout nahi hoga.
 */
export default function SecuritySessionWatch() {
  const signingOut = useRef(false);
  const filePickerOpen = useRef(false);
  const filePickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hardLogout = async () => {
      if (signingOut.current) return;
      if (filePickerOpen.current) return; // ← gallery open hai, logout mat karo
      signingOut.current = true;
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.replace("/login");
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        void hardLogout();
      } else {
        // Tab wapas visible hua — file picker band ho gaya
        filePickerOpen.current = false;
        if (filePickerTimer.current) {
          clearTimeout(filePickerTimer.current);
          filePickerTimer.current = null;
        }
      }
    };

    const onPopState = () => {
      void hardLogout();
    };

    // Jab bhi koi file input click ho, 30 sec ke liye logout disable karo
    const onFileInputClick = () => {
      filePickerOpen.current = true;
      signingOut.current = false; // reset
      if (filePickerTimer.current) clearTimeout(filePickerTimer.current);
      // 30 sec baad automatically reset (agar user cancel kare)
      filePickerTimer.current = setTimeout(() => {
        filePickerOpen.current = false;
      }, 30000);
    };

    // Saare file inputs par listener lagao
    const attachFileListeners = () => {
      document.querySelectorAll('input[type="file"]').forEach((el) => {
        el.removeEventListener("click", onFileInputClick);
        el.addEventListener("click", onFileInputClick);
      });
    };

    // Initial attach
    attachFileListeners();

    // DOM changes par bhi attach karo (dynamic inputs ke liye)
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