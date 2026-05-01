"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Check, CheckCheck, Loader2, LogOut,
  Paperclip, Send, X, FileText, Download,
  Trash2, Image as ImageIcon, Reply, CornerUpLeft,
  Eraser, Palette, Info, Clock
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  aurora: {
    name: "Aurora",
    preview: ["#070b14", "#0d1f3c", "#7c3aed"],
    bg: "#070b14",
    gradientA: "#0a1628",
    gradientB: "#0d2240",
    orb1: "rgba(124,58,237,0.18)",
    orb2: "rgba(16,185,129,0.12)",
    orb3: "rgba(59,130,246,0.10)",
    surface: "rgba(255,255,255,0.045)",
    surfaceHover: "rgba(255,255,255,0.08)",
    surfaceSolid: "#0d1f3c",
    border: "rgba(255,255,255,0.09)",
    borderGlow: "rgba(124,58,237,0.4)",
    headerBg: "rgba(7,11,20,0.85)",
    inputBg: "rgba(255,255,255,0.05)",
    myBubble: "linear-gradient(135deg, rgba(109,40,217,0.85) 0%, rgba(37,99,235,0.80) 100%)",
    myBubbleSolid: "#6d28d9",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(255,255,255,0.07)",
    otherBubbleText: "#e2e8f0",
    accent: "#8b5cf6",
    accent2: "#10b981",
    accentText: "#ffffff",
    accentSoft: "rgba(139,92,246,0.15)",
    dateBg: "rgba(7,11,20,0.75)",
    dateText: "#7c8fa8",
    time: "rgba(255,255,255,0.40)",
    sendBtn: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
    sendBtnSolid: "#7c3aed",
    tickSeen: "#818cf8",
  },
  emerald: {
    name: "Emerald",
    preview: ["#040d0a", "#051a14", "#10b981"],
    bg: "#040d0a",
    gradientA: "#051a14",
    gradientB: "#061e17",
    orb1: "rgba(16,185,129,0.15)",
    orb2: "rgba(52,211,153,0.10)",
    orb3: "rgba(6,182,212,0.08)",
    surface: "rgba(255,255,255,0.045)",
    surfaceHover: "rgba(255,255,255,0.08)",
    surfaceSolid: "#061e17",
    border: "rgba(255,255,255,0.08)",
    borderGlow: "rgba(16,185,129,0.4)",
    headerBg: "rgba(4,13,10,0.85)",
    inputBg: "rgba(255,255,255,0.05)",
    myBubble: "linear-gradient(135deg, rgba(13,148,136,0.88) 0%, rgba(5,150,105,0.82) 100%)",
    myBubbleSolid: "#0d9488",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(255,255,255,0.07)",
    otherBubbleText: "#d1fae5",
    accent: "#10b981",
    accent2: "#06b6d4",
    accentText: "#ffffff",
    accentSoft: "rgba(16,185,129,0.15)",
    dateBg: "rgba(4,13,10,0.75)",
    dateText: "#6b8f7a",
    time: "rgba(255,255,255,0.38)",
    sendBtn: "linear-gradient(135deg, #059669 0%, #0891b2 100%)",
    sendBtnSolid: "#059669",
    tickSeen: "#34d399",
  },
  rose: {
    name: "Rose",
    preview: ["#0f060a", "#1e0d14", "#f43f5e"],
    bg: "#0f060a",
    gradientA: "#1a0812",
    gradientB: "#1e0d14",
    orb1: "rgba(244,63,94,0.15)",
    orb2: "rgba(251,113,133,0.10)",
    orb3: "rgba(217,70,239,0.08)",
    surface: "rgba(255,255,255,0.045)",
    surfaceHover: "rgba(255,255,255,0.08)",
    surfaceSolid: "#1e0d14",
    border: "rgba(255,255,255,0.08)",
    borderGlow: "rgba(244,63,94,0.4)",
    headerBg: "rgba(15,6,10,0.85)",
    inputBg: "rgba(255,255,255,0.05)",
    myBubble: "linear-gradient(135deg, rgba(225,29,72,0.85) 0%, rgba(168,85,247,0.75) 100%)",
    myBubbleSolid: "#e11d48",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(255,255,255,0.07)",
    otherBubbleText: "#fce7f3",
    accent: "#f43f5e",
    accent2: "#a855f7",
    accentText: "#ffffff",
    accentSoft: "rgba(244,63,94,0.15)",
    dateBg: "rgba(15,6,10,0.75)",
    dateText: "#7a5560",
    time: "rgba(255,255,255,0.38)",
    sendBtn: "linear-gradient(135deg, #e11d48 0%, #9333ea 100%)",
    sendBtnSolid: "#e11d48",
    tickSeen: "#fb7185",
  },
  gold: {
    name: "Luxe Gold",
    preview: ["#0c0800", "#1a1200", "#f59e0b"],
    bg: "#0c0800",
    gradientA: "#150f00",
    gradientB: "#1a1200",
    orb1: "rgba(245,158,11,0.14)",
    orb2: "rgba(252,211,77,0.08)",
    orb3: "rgba(251,146,60,0.08)",
    surface: "rgba(255,255,255,0.045)",
    surfaceHover: "rgba(255,255,255,0.075)",
    surfaceSolid: "#1a1200",
    border: "rgba(255,220,80,0.12)",
    borderGlow: "rgba(245,158,11,0.45)",
    headerBg: "rgba(12,8,0,0.88)",
    inputBg: "rgba(255,255,255,0.05)",
    myBubble: "linear-gradient(135deg, rgba(180,120,0,0.90) 0%, rgba(217,119,6,0.85) 100%)",
    myBubbleSolid: "#b45309",
    myBubbleText: "#fff9e6",
    otherBubble: "rgba(255,255,255,0.065)",
    otherBubbleText: "#fde68a",
    accent: "#f59e0b",
    accent2: "#fb923c",
    accentText: "#000000",
    accentSoft: "rgba(245,158,11,0.15)",
    dateBg: "rgba(12,8,0,0.80)",
    dateText: "#78663a",
    time: "rgba(255,220,80,0.35)",
    sendBtn: "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
    sendBtnSolid: "#b45309",
    tickSeen: "#fbbf24",
  },
  ice: {
    name: "Ice",
    preview: ["#f0f6ff", "#e2ecfa", "#3b82f6"],
    bg: "#f0f6ff",
    gradientA: "#e8f0fb",
    gradientB: "#ddeaf8",
    orb1: "rgba(59,130,246,0.12)",
    orb2: "rgba(99,102,241,0.08)",
    orb3: "rgba(14,165,233,0.10)",
    surface: "rgba(255,255,255,0.75)",
    surfaceHover: "rgba(255,255,255,0.90)",
    surfaceSolid: "#ffffff",
    border: "rgba(59,130,246,0.15)",
    borderGlow: "rgba(59,130,246,0.35)",
    headerBg: "rgba(240,246,255,0.90)",
    inputBg: "rgba(255,255,255,0.80)",
    myBubble: "linear-gradient(135deg, rgba(37,99,235,0.90) 0%, rgba(79,70,229,0.85) 100%)",
    myBubbleSolid: "#2563eb",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(255,255,255,0.85)",
    otherBubbleText: "#1e293b",
    accent: "#3b82f6",
    accent2: "#8b5cf6",
    accentText: "#ffffff",
    accentSoft: "rgba(59,130,246,0.12)",
    dateBg: "rgba(240,246,255,0.85)",
    dateText: "#64748b",
    time: "rgba(30,41,59,0.35)",
    sendBtn: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
    sendBtnSolid: "#2563eb",
    tickSeen: "#3b82f6",
  },
  obsidian: {
    name: "Obsidian",
    preview: ["#080808", "#111111", "#6366f1"],
    bg: "#080808",
    gradientA: "#0d0d0d",
    gradientB: "#111111",
    orb1: "rgba(99,102,241,0.12)",
    orb2: "rgba(168,85,247,0.08)",
    orb3: "rgba(236,72,153,0.06)",
    surface: "rgba(255,255,255,0.04)",
    surfaceHover: "rgba(255,255,255,0.07)",
    surfaceSolid: "#141414",
    border: "rgba(255,255,255,0.07)",
    borderGlow: "rgba(99,102,241,0.35)",
    headerBg: "rgba(8,8,8,0.92)",
    inputBg: "rgba(255,255,255,0.04)",
    myBubble: "linear-gradient(135deg, rgba(67,56,202,0.90) 0%, rgba(124,58,237,0.85) 100%)",
    myBubbleSolid: "#4338ca",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(255,255,255,0.055)",
    otherBubbleText: "#c7d2fe",
    accent: "#6366f1",
    accent2: "#a855f7",
    accentText: "#ffffff",
    accentSoft: "rgba(99,102,241,0.14)",
    dateBg: "rgba(8,8,8,0.80)",
    dateText: "#4a5280",
    time: "rgba(255,255,255,0.32)",
    sendBtn: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
    sendBtnSolid: "#4338ca",
    tickSeen: "#818cf8",
  },
} as const;

type ThemeKey = keyof typeof THEMES;

const WALLPAPERS = [
  { id: "none",      label: "None",      value: "" },
  { id: "forest",    label: "Forest",    value: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80" },
  { id: "ocean",     label: "Ocean",     value: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80" },
  { id: "mountains", label: "Pahad",     value: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80" },
  { id: "night",     label: "Night Sky", value: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80" },
  { id: "abstract",  label: "Abstract",  value: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80" },
];

export default function ChatRoom({ userId, username }: { userId: string; username: string }) {
  const supabase = useMemo(() => createClient(), []);

  const [allMessages, setAllMessages]     = useState<any[]>([]);
  const [draft, setDraft]                 = useState("");
  const [loading, setLoading]             = useState(true);
  const [uploading, setUploading]         = useState(false);
  const [selectedFile, setSelectedFile]   = useState<File | null>(null);
  const [filePreview, setFilePreview]     = useState<string | null>(null);
  const [deleteModal, setDeleteModal]     = useState<{ id: string; mine: boolean } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [otherUser, setOtherUser]         = useState<any>(null);
  const [othersTyping, setOthersTyping]   = useState(false);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isAtBottom, setIsAtBottom]       = useState(false);
  const [replyTo, setReplyTo]             = useState<any>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showWallpaperPanel, setShowWallpaperPanel] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [lastSeenTimer, setLastSeenTimer] = useState(0);
  const [infoModal, setInfoModal]         = useState<any | null>(null); // ← seen-time info
  const [selectedMsgs, setSelectedMsgs]   = useState<string[]>([]); // ← multi-select
  const [selectMode, setSelectMode]       = useState(false); // ← selection mode

  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    if (typeof window === "undefined") return "aurora";
    return (localStorage.getItem("chat_theme") as ThemeKey) || "aurora";
  });
  const [wallpaper, setWallpaper] = useState<string>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("chat_wallpaper") || "") : ""
  );
  const [customUrl, setCustomUrl] = useState("");

  const t = THEMES[themeKey];

  const bottomRef        = useRef<HTMLDivElement>(null);
  const firstUnreadRef   = useRef<HTMLDivElement>(null);
  const mainRef          = useRef<HTMLDivElement>(null);
  const fileInputRef     = useRef<HTMLInputElement>(null);
  const textareaRef      = useRef<HTMLTextAreaElement>(null);
  const longPressTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeout    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef      = useRef(false);
  const typingChRef      = useRef<any>(null);
  const firstUnreadId    = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setLastSeenTimer((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  // ─── 1. Messages + Realtime ───────────────────────────────────────────────
  useEffect(() => {
    async function initChat() {
      const { data } = await supabase
        .from("messages").select("*").order("created_at", { ascending: true });
      if (data) {
        setAllMessages(data);
        const unseenMsgs = data.filter((m) => m.user_id !== userId && !m.is_seen);
        if (unseenMsgs.length > 0) {
          setUnreadCount(unseenMsgs.length);
          firstUnreadId.current = unseenMsgs[0].id;
          setIsAtBottom(false);
          setTimeout(() => firstUnreadRef.current?.scrollIntoView({ behavior: "instant", block: "center" }), 200);
        } else {
          setIsAtBottom(true);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 100);
        }
      }
      setLoading(false);
    }
    initChat();

    const channel = supabase.channel("global-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setAllMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          if (payload.new.user_id !== userId) {
            setIsAtBottom((atBottom) => {
              if (!atBottom) setUnreadCount((c) => c + 1);
              else setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
              return atBottom;
            });
          } else {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
          }
        } else if (payload.eventType === "UPDATE") {
          setAllMessages((prev) => prev.map((m) => m.id === payload.new.id ? payload.new : m));
        } else if (payload.eventType === "DELETE") {
          setAllMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, userId]);

  // ─── 2. Blue Tick (simple - mark all received messages as seen) ──────────
  useEffect(() => {
    const unseen = allMessages.filter((m) => m.user_id !== userId && !m.is_seen);
    if (unseen.length === 0) return;
    const ids = unseen.map((m) => m.id);
    const seenAt = new Date().toISOString();
    supabase.from("messages")
      .update({ is_seen: true, seen_at: seenAt })
      .in("id", ids)
      .then(({ error }) => { if (error) console.error("Seen error:", error); });
  }, [allMessages, userId, supabase]);

  // ─── 3. Online / Last Seen ────────────────────────────────────────────────
  useEffect(() => {
    const goOnline = async () => {
      const { data: ex } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
      if (ex) await supabase.from("profiles").update({ is_online: true, username }).eq("id", userId);
      else await supabase.from("profiles").insert({ id: userId, username, is_online: true, last_seen_at: null });
    };
    const goOffline = async () => {
      await supabase.from("profiles").update({ is_online: false, last_seen_at: new Date().toISOString() }).eq("id", userId);
    };
    goOnline();
    const hv = () => { if (document.hidden) goOffline(); else goOnline(); };
    document.addEventListener("visibilitychange", hv);
    window.addEventListener("beforeunload", goOffline);

    const fetchOther = async () => {
      const { data } = await supabase.from("profiles")
        .select("id, username, is_online, last_seen_at").neq("id", userId).limit(1).maybeSingle();
      if (data) setOtherUser(data);
    };
    fetchOther();

    const pCh = supabase.channel("profiles-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (p) => {
        if (p.new && (p.new as any).id !== userId) setOtherUser(p.new);
      }).subscribe();

    return () => {
      goOffline();
      document.removeEventListener("visibilitychange", hv);
      window.removeEventListener("beforeunload", goOffline);
      supabase.removeChannel(pCh);
    };
  }, [userId, username, supabase]);

  // ─── 4. Typing Broadcast ──────────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel("typing-v3", { config: { broadcast: { self: false, ack: false } } });
    ch.on("broadcast", { event: "typing" }, ({ payload }) => {
      if (!payload || payload.userId === userId) return;
      if (payload.isTyping) {
        setOthersTyping(true);
        if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
        typingClearTimer.current = setTimeout(() => setOthersTyping(false), 4000);
      } else {
        setOthersTyping(false);
        if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
      }
    });
    ch.subscribe((s) => { if (s === "SUBSCRIBED") typingChRef.current = ch; });
    return () => { typingChRef.current = null; supabase.removeChannel(ch); };
  }, [userId, supabase]);

  const sendTypingSignal = useCallback((isTyping: boolean) => {
    typingChRef.current?.send({ type: "broadcast", event: "typing", payload: { userId, isTyping } });
  }, [userId]);

  const handleTyping = useCallback((value: string) => {
    setDraft(value);
    setTimeout(autoResize, 0);
    if (!isTypingRef.current) { isTypingRef.current = true; sendTypingSignal(true); }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => { isTypingRef.current = false; sendTypingSignal(false); }, 2000);
  }, [sendTypingSignal]);

  // ─── 5. Scroll ────────────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
    if (atBottom) { setUnreadCount(0); firstUnreadId.current = null; }
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0); firstUnreadId.current = null; setIsAtBottom(true);
  };

  // ─── 6. Send Message ──────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft(""); setReplyTo(null);
    if (textareaRef.current) textareaRef.current.style.height = "42px";
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    isTypingRef.current = false; sendTypingSignal(false);

    const msgData: any = { user_id: userId, username, text, is_seen: false, seen_at: null, deleted_for: [] };
    if (replyTo) {
      msgData.reply_to_id   = replyTo.id;
      msgData.reply_to_text = replyTo.text || replyTo.file_name || "📎 File";
      msgData.reply_to_user = replyTo.username;
    }
    const { data } = await supabase.from("messages").insert([msgData]).select();
    if (data) {
      setAllMessages((prev) => {
        if (prev.find((m) => m.id === data[0].id)) return prev;
        return [...prev, data[0]];
      });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  // ─── 7. File Select / Send ────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { alert("File 25MB se badi nahi!"); return; }
    setSelectedFile(file);
    if (file.type.startsWith("image/") || file.type.startsWith("video/"))
      setFilePreview(URL.createObjectURL(file));
    else setFilePreview(null);
  };

  const cancelFile = () => {
    setSelectedFile(null); setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const ext = selectedFile.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${ext}`;
      let fileType = "file";
      if (selectedFile.type.startsWith("image/")) fileType = "image";
      else if (selectedFile.type.startsWith("video/")) fileType = "video";
      else if (selectedFile.type.startsWith("audio/")) fileType = "audio";

      const { error: upErr } = await supabase.storage.from("chat-files").upload(filePath, selectedFile);
      if (upErr) throw upErr;
      const { data: urlData } = await supabase.storage.from("chat-files").createSignedUrl(filePath, 60 * 60 * 24 * 365);

      const msgData: any = {
        user_id: userId, username, text: selectedFile.name,
        file_url: urlData?.signedUrl, file_type: fileType,
        file_name: selectedFile.name, file_size: selectedFile.size,
        is_seen: false, seen_at: null, deleted_for: [],
      };
      if (replyTo) {
        msgData.reply_to_id   = replyTo.id;
        msgData.reply_to_text = replyTo.text || replyTo.file_name || "📎 File";
        msgData.reply_to_user = replyTo.username;
      }
      const { data, error } = await supabase.from("messages").insert([msgData]).select();
      if (error) throw error;
      if (data) {
        setAllMessages((prev) => {
          if (prev.find((m) => m.id === data[0].id)) return prev;
          return [...prev, data[0]];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
      cancelFile(); setReplyTo(null);
    } catch (err: any) { alert("File bhejne mein error: " + err.message); }
    finally { setUploading(false); }
  };

  // ─── 8. Delete ────────────────────────────────────────────────────────────
  const deleteForEveryone = async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) { alert("Delete error: " + error.message); return; }
    setAllMessages((prev) => prev.filter((m) => m.id !== id));
    setDeleteModal(null);
  };

  const deleteForMe = async (id: string) => {
    const msg = allMessages.find((m) => m.id === id);
    const updated = [...(msg?.deleted_for || []), userId];
    await supabase.from("messages").update({ deleted_for: updated }).eq("id", id);
    setAllMessages((prev) => prev.map((m) => m.id === id ? { ...m, deleted_for: updated } : m));
    setDeleteModal(null);
  };

  // ─── 9. Clear Chat ────────────────────────────────────────────────────────
  const clearChatForMe = async () => {
    const visible = allMessages.filter((m) => !(m.deleted_for || []).includes(userId));
    for (const m of visible) {
      const updated = [...(m.deleted_for || []), userId];
      await supabase.from("messages").update({ deleted_for: updated }).eq("id", m.id);
    }
    setAllMessages((prev) => prev.map((m) => ({ ...m, deleted_for: [...(m.deleted_for || []), userId] })));
    setShowClearConfirm(false);
  };

  // ─── 10. Jump to reply ────────────────────────────────────────────────────
  const jumpToMessage = useCallback((id: string) => {
    const bubble = document.getElementById(`bubble-${id}`);
    if (!bubble) return;
    bubble.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 1500);
  }, []);

  // ─── 11. Theme apply ──────────────────────────────────────────────────────
  const applyTheme = (key: ThemeKey) => {
    setThemeKey(key);
    localStorage.setItem("chat_theme", key);
    setShowThemePanel(false);
  };

  // ─── 12. Helpers ──────────────────────────────────────────────────────────
  const formatLastSeen = (ts: string) => {
    if (!ts) return "pehle";
    const d = new Date(ts), now = new Date();
    const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (sec < 30) return "abhi abhi";
    if (sec < 60) return `${sec} second pehle`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} minute pehle`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `aaj ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} ko`;
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    if (d.toDateString() === yest.toDateString())
      return `kal ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} ko`;
    return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} ko`;
  };

  const formatExactDateTime = (ts: string) => {
    if (!ts) return null;
    const d = new Date(ts);
    return d.toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    });
  };

  const formatSize = (b: number) => {
    if (!b) return "";
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
    return (b / 1048576).toFixed(1) + " MB";
  };

  const applyWallpaper = (url: string) => {
    setWallpaper(url); localStorage.setItem("chat_wallpaper", url);
    setShowWallpaperPanel(false); setCustomUrl("");
  };

  const longPressTriggered = useRef(false);

  const handleTouchStart = (id: string) => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setSelectMode(true);
      setSelectedMsgs((prev) => prev.includes(id) ? prev : [...prev, id]);
      if (navigator.vibrate) navigator.vibrate(60);
    }, 1500);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = () => {
    clearLongPress();
    // small delay so onClick doesn't fire right after long press activates selectMode
    setTimeout(() => { longPressTriggered.current = false; }, 100);
  };

  const toggleSelectMsg = (id: string) => {
    if (longPressTriggered.current) return; // ignore toggle right after long press
    setSelectedMsgs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const cancelSelection = () => { setSelectMode(false); setSelectedMsgs([]); };

  const deleteSelected = async (forEveryone: boolean) => {
    for (const id of selectedMsgs) {
      const msg = allMessages.find((m) => m.id === id);
      if (!msg) continue;
      const mine = msg.user_id === userId;
      if (forEveryone && mine) {
        await supabase.from("messages").delete().eq("id", id);
      } else {
        const updated = [...(msg.deleted_for || []), userId];
        await supabase.from("messages").update({ deleted_for: updated }).eq("id", id);
      }
    }
    if (forEveryone) {
      setAllMessages((prev) => prev.filter((m) => !selectedMsgs.includes(m.id)));
    } else {
      setAllMessages((prev) => prev.map((m) => selectedMsgs.includes(m.id)
        ? { ...m, deleted_for: [...(m.deleted_for || []), userId] } : m));
    }
    cancelSelection();
  };

  // ─── 13. Render content ───────────────────────────────────────────────────
  const renderContent = (m: any) => {
    if (m.file_type === "image") return (
      <img src={m.file_url} alt={m.file_name} onClick={() => setFullscreenImg(m.file_url)}
        className="max-w-[220px] max-h-[280px] rounded-xl cursor-zoom-in object-cover block" />
    );
    if (m.file_type === "video") return (
      <video controls className="max-w-[240px] max-h-[280px] rounded-xl block"><source src={m.file_url} /></video>
    );
    if (m.file_type === "audio") return (
      <audio controls className="w-[200px]"><source src={m.file_url} /></audio>
    );
    if (m.file_url && m.file_type === "file") return (
      <a href={m.file_url} target="_blank" rel="noreferrer"
        className="flex items-center gap-2 rounded-xl px-3 py-2 no-underline transition-colors"
        style={{ background: "rgba(0,0,0,0.2)" }}>
        <FileText className="size-8 shrink-0" style={{ color: t.accent }} />
        <div className="min-w-0">
          <p className="text-[13px] font-medium truncate max-w-[160px]" style={{ color: t.myBubbleText }}>{m.file_name}</p>
          <p className="text-[10px] opacity-60">{formatSize(m.file_size)}</p>
        </div>
        <Download className="size-4 shrink-0 opacity-60" />
      </a>
    );
    return <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{m.text}</p>;
  };

  // ─── 14. Timeline ─────────────────────────────────────────────────────────
  const visibleMessages = allMessages.filter((m) => !(m.deleted_for || []).includes(userId));
  const timeline = visibleMessages.reduce((acc: any[], m: any, i: number, arr: any[]) => {
    const date = new Date(m.created_at).toDateString();
    const prevDate = i > 0 ? new Date(arr[i - 1].created_at).toDateString() : null;
    if (date !== prevDate) {
      const today = new Date().toDateString(), yest = new Date(Date.now() - 86400000).toDateString();
      const label = date === today ? "Aaj" : date === yest ? "Kal"
        : new Date(m.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      acc.push({ kind: "date", key: "date-" + i, label });
    }
    acc.push({ kind: "message", message: m, isFirstUnread: m.id === firstUnreadId.current });
    return acc;
  }, []);

  // ─── 15. Header subtitle ──────────────────────────────────────────────────
  const headerSubtitle = () => {
    if (othersTyping) return (
      <span className="text-[11px] flex items-center gap-1.5" style={{ color: t.accent }}>
        <span className="flex gap-[3px] items-end">
          {[0, 150, 300].map((d) => (
            <span key={d} className="w-[5px] h-[5px] rounded-full animate-bounce"
              style={{ backgroundColor: t.accent, animationDelay: `${d}ms`, animationDuration: "0.8s" }} />
          ))}
        </span>
        typing...
      </span>
    );
    if (!otherUser) return null;
    if (otherUser.is_online) return (
      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: t.accent2 }}>
        <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ backgroundColor: t.accent2 }} />
        Online
      </span>
    );
    if (!otherUser.last_seen_at) return null;
    return (
      <span key={lastSeenTimer} className="text-[11px]" style={{ color: t.dateText }}>
        Last seen {formatLastSeen(otherUser.last_seen_at)}
      </span>
    );
  };

  const isLightTheme = themeKey === "ice";

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: t.bg }}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin size-8" style={{ color: t.accent }} />
        <span className="text-sm" style={{ color: t.dateText }}>Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] flex-col relative overflow-hidden" style={{ background: t.bg, color: t.otherBubbleText }}>
      
      {/* ── Ambient background orbs ── */}
      {!wallpaper && (
        <>
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-70"
              style={{ background: t.orb1 }} />
            <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full blur-[100px] opacity-60"
              style={{ background: t.orb2 }} />
            <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full blur-[90px] opacity-50"
              style={{ background: t.orb3 }} />
          </div>
          {/* Subtle grid overlay */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(${isLightTheme ? "#000" : "#fff"} 1px, transparent 1px), linear-gradient(90deg, ${isLightTheme ? "#000" : "#fff"} 1px, transparent 1px)`,
              backgroundSize: "40px 40px"
            }} />
        </>
      )}

      {wallpaper && <div className="absolute inset-0 z-0" style={{ backgroundImage: `url('${wallpaper}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>}

      {/* ── Header ── */}
      <header className="relative z-20 px-4 py-3 flex justify-between items-center shrink-0"
        style={{
          background: t.headerBg,
          borderBottom: `1px solid ${t.border}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: t.accentSoft, border: `1px solid ${t.borderGlow}` }}>
            <span className="text-base">🔒</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-bold text-[15px] tracking-tight leading-tight" style={{
              background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Private Portal
            </h1>
            <div className="min-h-[14px] flex items-center">{headerSubtitle()}</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[
            { icon: <Palette className="size-[18px]" />, label: "Theme", action: () => setShowThemePanel(true) },
            { icon: <Eraser className="size-[18px]" />, label: "Clear", action: () => setShowClearConfirm(true) },
            { icon: <ImageIcon className="size-[18px]" />, label: "Wallpaper", action: () => setShowWallpaperPanel(true) },
            { icon: <LogOut className="size-[18px]" />, label: "Logout", action: () => supabase.auth.signOut().then(() => window.location.reload()) },
          ].map(({ icon, label, action }) => (
            <button key={label} onClick={action} title={label}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ color: t.dateText }}
              onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.surfaceHover; (e.currentTarget as HTMLButtonElement).style.color = t.accent; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = t.dateText; }}>
              {icon}
            </button>
          ))}
        </div>
      </header>

      {/* ── Messages ── */}
      <main ref={mainRef} onScroll={handleScroll} className="relative z-10 flex-1 overflow-y-auto px-4 pt-4 pb-36"
        style={{ scrollbarWidth: "thin", scrollbarColor: `${t.border} transparent` }}>
        {timeline.map((item: any) => {
          if (item.kind === "date") return (
            <div key={item.key} className="flex justify-center my-5">
              <span className="px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest"
                style={{
                  background: t.dateBg,
                  color: t.dateText,
                  border: `1px solid ${t.border}`,
                  backdropFilter: "blur(8px)",
                }}>
                {item.label}
              </span>
            </div>
          );

          const m = item.message;
          const mine = m.user_id === userId;
          const isHighlighted = highlightedId === m.id;

          return (
            <div key={m.id}>
              {item.isFirstUnread && (
                <div ref={firstUnreadRef} className="flex items-center gap-2 my-5">
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}55)` }} />
                  <span className="text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{ color: t.accent, background: t.accentSoft, border: `1px solid ${t.accent}33` }}>
                    ↓ {unreadCount} naye message
                  </span>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${t.accent}55, transparent)` }} />
                </div>
              )}

              <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-2 group`}>
                {/* Action buttons for others */}
                {!mine && (
                  <div className="flex flex-col gap-1 mr-1.5 self-end mb-1 opacity-40 group-hover:opacity-100 transition-all duration-200">
                    <button onClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                      className="p-1.5 rounded-xl hover:scale-105"
                      style={{ background: t.surface, color: t.accent, border: `1px solid ${t.border}` }}>
                      <CornerUpLeft className="size-3.5" />
                    </button>
                    <button onClick={() => { toggleSelectMsg(m.id); if(!selectMode) setSelectMode(true); }}
                      className="p-1.5 rounded-xl hover:scale-105"
                      style={{ background: selectedMsgs.includes(m.id) ? t.accent : t.surface, color: selectedMsgs.includes(m.id) ? '#fff' : t.dateText, border: `1px solid ${t.border}` }}
                      title="Select">
                      <span className="text-[10px] font-bold">{selectedMsgs.includes(m.id) ? '✓' : '☐'}</span>
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-1 max-w-[82%]">
                  <div
                    id={`bubble-${m.id}`}
                    onClick={() => { if (selectMode) toggleSelectMsg(m.id); }}
                    className="rounded-2xl px-3.5 py-2.5 cursor-pointer select-none transition-all duration-300"
                    style={{
                      background: mine ? t.myBubble : t.otherBubble,
                      color: mine ? t.myBubbleText : t.otherBubbleText,
                      borderRadius: mine ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                      border: `1px solid ${mine ? "rgba(255,255,255,0.12)" : t.border}`,
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      transform: isHighlighted ? "scale(1.02)" : "scale(1)",
                      boxShadow: selectedMsgs.includes(m.id)
                        ? `0 0 0 2.5px ${t.accent}, 0 8px 32px rgba(0,0,0,0.3)`
                        : isHighlighted
                        ? `0 0 0 2px ${t.accent}, 0 8px 32px rgba(0,0,0,0.3)`
                        : "0 2px 12px rgba(0,0,0,0.2)",
                      opacity: selectMode && !selectedMsgs.includes(m.id) ? 0.6 : 1,
                    }}
                  >
                    {!mine && (
                      <p className="text-[10px] font-black mb-1 uppercase tracking-wide" style={{ color: t.accent }}>
                        {m.username}
                      </p>
                    )}

                    {m.reply_to_id && (
                      <div
                        onClick={(e) => { e.stopPropagation(); jumpToMessage(m.reply_to_id); }}
                        className="mb-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-opacity active:opacity-60"
                        style={{ background: "rgba(0,0,0,0.22)", borderLeft: `3px solid ${t.accent}` }}>
                        <p className="text-[10px] font-bold mb-0.5" style={{ color: t.accent }}>
                          ↩ {m.reply_to_user === username ? "Aap" : m.reply_to_user}
                        </p>
                        <p className="text-[11px] opacity-70 truncate max-w-[200px]">{m.reply_to_text}</p>
                      </div>
                    )}

                    {renderContent(m)}

                    {/* Timestamp row */}
                    <div className="flex items-center justify-end gap-1.5 mt-1.5">
                      <span className="text-[9px] font-medium" style={{ color: t.time }}>
                        {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                      </span>
                      {mine && (
                        <>
                          {m.is_seen
                            ? <CheckCheck className="size-3.5" style={{ color: t.tickSeen }} />
                            : <Check className="size-3" style={{ color: t.time }} />
                          }
                          {/* ── Info button for seen time ── */}
                          <button
                            onPointerUp={(e) => { e.stopPropagation(); e.preventDefault(); if(!selectMode) setInfoModal(m); }}
                            className="opacity-60 hover:opacity-100 active:opacity-100 transition-opacity p-1.5 -m-1"
                            title="Message info"
                            style={{ color: t.time }}>
                            <Info className="size-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons for mine */}
                {mine && (
                  <div className="flex flex-col gap-1 ml-1.5 self-end mb-1 opacity-40 group-hover:opacity-100 transition-all duration-200">
                    <button onClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                      className="p-1.5 rounded-xl hover:scale-105"
                      style={{ background: t.surface, color: t.accent, border: `1px solid ${t.border}` }}>
                      <CornerUpLeft className="size-3.5" />
                    </button>
                    <button onClick={() => { toggleSelectMsg(m.id); if(!selectMode) setSelectMode(true); }}
                      className="p-1.5 rounded-xl hover:scale-105"
                      style={{ background: selectedMsgs.includes(m.id) ? t.accent : t.surface, color: selectedMsgs.includes(m.id) ? '#fff' : t.dateText, border: `1px solid ${t.border}` }}
                      title="Select">
                      <span className="text-[10px] font-bold">{selectedMsgs.includes(m.id) ? '✓' : '☐'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* ── Unread badge ── */}
      {unreadCount > 0 && !isAtBottom && (
        <button onClick={scrollToBottom}
          className="fixed bottom-28 right-4 z-40 rounded-full pl-3 pr-4 py-2.5 text-sm font-bold shadow-2xl flex items-center gap-2 transition-all hover:scale-105"
          style={{
            background: t.sendBtn,
            color: "#fff",
            boxShadow: `0 4px 24px ${t.myBubbleSolid}55`,
          }}>
          <span>↓</span>
          <span>{unreadCount} naya</span>
        </button>
      )}

      {/* ── File Preview Bar ── */}
      {selectedFile && (
        <div className="fixed bottom-[72px] left-0 right-0 p-3 z-40"
          style={{ background: t.headerBg, borderTop: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
          <div className="mx-auto max-w-4xl flex items-center gap-3">
            {filePreview && selectedFile.type.startsWith("image/") && (
              <img src={filePreview} className="size-14 object-cover rounded-xl shrink-0" />
            )}
            {!filePreview && (
              <div className="size-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <FileText className="size-6" style={{ color: t.dateText }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs opacity-50">{formatSize(selectedFile.size)}</p>
            </div>
            <button onClick={cancelFile} className="p-1.5 rounded-lg" style={{ color: t.dateText }}>
              <X className="size-4" />
            </button>
            <button onClick={sendFile} disabled={uploading}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: t.sendBtn, color: "#fff" }}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {uploading ? "Bhej raha..." : "Bhejo"}
            </button>
          </div>
        </div>
      )}

      {/* ── Multi-select Bar ── */}
      {selectMode && selectedMsgs.length > 0 && (
        <div className="fixed bottom-0 w-full z-[60] flex items-center justify-between px-4 py-4 gap-3"
          style={{ background: t.surfaceSolid, borderTop: `2px solid ${t.accent}`, backdropFilter: "blur(20px)" }}>
          <button onClick={cancelSelection} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: t.surface, color: t.dateText, border: `1px solid ${t.border}` }}>
            <X className="size-4" /> Cancel
          </button>
          <span className="text-sm font-bold" style={{ color: t.accent }}>
            {selectedMsgs.length} selected
          </span>
          <div className="flex gap-2">
            <button onClick={() => deleteSelected(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: t.surface, color: t.otherBubbleText, border: `1px solid ${t.border}` }}>
              Mere liye
            </button>
            {selectedMsgs.every((id) => allMessages.find((m) => m.id === id)?.user_id === userId) && (
              <button onClick={() => deleteSelected(true)}
                className="px-3 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff" }}>
                Sabke liye
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="fixed bottom-0 w-full z-50"
        style={{ background: t.headerBg, borderTop: `1px solid ${t.border}`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        {replyTo && (
          <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5 mx-auto max-w-4xl"
            style={{ borderBottom: `1px solid ${t.border}` }}>
            <div className="p-1 rounded-lg" style={{ background: t.accentSoft }}>
              <Reply className="size-3.5" style={{ color: t.accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold" style={{ color: t.accent }}>
                {replyTo.user_id === userId ? "Apne message ko" : replyTo.username + " ko"} reply
              </p>
              <p className="text-[11px] opacity-60 truncate">{replyTo.text || replyTo.file_name || "📎 File"}</p>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ color: t.dateText }}>
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="mx-auto flex max-w-4xl gap-2 items-end p-3">
          <input ref={fileInputRef} type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            onChange={handleFileSelect} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl shrink-0 mb-0.5 transition-all hover:scale-105 active:scale-95"
            style={{ background: t.surface, color: t.dateText, border: `1px solid ${t.border}` }}>
            <Paperclip className="size-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); selectedFile ? sendFile() : sendMessage(); } }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 rounded-2xl px-4 py-2.5 outline-none text-sm resize-none overflow-hidden min-h-[42px] max-h-[120px] leading-relaxed placeholder-opacity-40"
            style={{
              background: t.inputBg,
              color: t.otherBubbleText,
              border: `1px solid ${t.border}`,
              height: "42px",
              backdropFilter: "blur(8px)",
            }}
          />
          <button onClick={selectedFile ? sendFile : sendMessage} disabled={uploading || (!draft.trim() && !selectedFile)}
            className="p-2.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 shrink-0 mb-0.5"
            style={{ background: t.sendBtn, color: "#fff", boxShadow: `0 4px 16px ${t.myBubbleSolid}40` }}>
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          </button>
        </div>
      </footer>

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* ── Message Info / Seen Time Modal ── */}
      {infoModal && (
        <div className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center px-6"
          onClick={() => setInfoModal(null)}>
          <div className="rounded-2xl w-full p-6 shadow-2xl"
            style={{ background: t.surfaceSolid, border: `1px solid ${t.border}`, maxWidth: "320px", margin: "0 auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: t.accentSoft }}>
                <Info className="size-5" style={{ color: t.accent }} />
              </div>
              <h2 className="font-bold text-base" style={{ color: t.otherBubbleText }}>Message Info</h2>
            </div>

            {/* Sent time */}
            <div className="flex items-start gap-3 mb-3 p-3 rounded-xl" style={{ background: t.surface }}>
              <Clock className="size-4 shrink-0 mt-0.5" style={{ color: t.dateText }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: t.dateText }}>Bheja gaya</p>
                <p className="text-[13px] font-medium" style={{ color: t.otherBubbleText }}>
                  {formatExactDateTime(infoModal.created_at) || "—"}
                </p>
              </div>
            </div>

            {/* Seen time */}
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: t.surface }}>
              <CheckCheck className="size-4 shrink-0 mt-0.5" style={{ color: infoModal.is_seen ? t.tickSeen : t.dateText }} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: infoModal.is_seen ? t.tickSeen : t.dateText }}>
                  {infoModal.is_seen ? "Dekha gaya" : "Abhi nahi dekha"}
                </p>
                {infoModal.is_seen && infoModal.seen_at ? (
                  <p className="text-[13px] font-medium" style={{ color: t.otherBubbleText }}>
                    {formatExactDateTime(infoModal.seen_at)}
                  </p>
                ) : (
                  <p className="text-[12px]" style={{ color: t.dateText }}>
                    {infoModal.is_seen ? "Seen time record nahi hua" : "Deliver hua, par seen nahi"}
                  </p>
                )}
              </div>
            </div>

            <button onClick={() => setInfoModal(null)}
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{ background: t.accentSoft, color: t.accent, border: `1px solid ${t.accent}33` }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Theme Panel ── */}
      {showThemePanel && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
          onClick={() => setShowThemePanel(false)}
          >
          <div className="rounded-t-3xl w-full max-w-lg p-5 pt-4"
            style={{ background: t.surfaceSolid, border: `1px solid ${t.border}`, borderBottom: "none" }}
            onClick={(e) => e.stopPropagation()}>
            {/* Handle bar */}
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: t.border }} />
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="font-bold text-base" style={{ color: t.otherBubbleText }}>Theme Chuno</h2>
                <p className="text-[11px] mt-0.5" style={{ color: t.dateText }}>Apni pasand ka theme lagao</p>
              </div>
              <button onClick={() => setShowThemePanel(false)} style={{ color: t.dateText }}>
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, th]) => (
                <button key={key} onClick={() => applyTheme(key)}
                  className="flex flex-col items-center gap-2 p-2.5 rounded-2xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: themeKey === key ? t.accentSoft : t.surface,
                    border: `1.5px solid ${themeKey === key ? t.accent : t.border}`,
                  }}>
                  <div className="relative w-16 h-12 rounded-xl overflow-hidden shadow-lg"
                    style={{ background: th.bg }}>
                    <div className="absolute inset-0 flex flex-col justify-end p-1.5 gap-1">
                      <div className="self-start h-4 rounded-lg px-1.5 flex items-center text-[7px] font-semibold"
                        style={{ background: th.otherBubble, color: th.otherBubbleText, maxWidth: "70%" }}>Hi!</div>
                      <div className="self-end h-4 rounded-lg px-1.5 flex items-center text-[7px] font-semibold"
                        style={{ background: th.myBubbleSolid, color: th.myBubbleText, maxWidth: "70%" }}>Hey</div>
                    </div>
                    {themeKey === key && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: th.accent, color: th.accentText }}>✓</div>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-center leading-tight"
                    style={{ color: themeKey === key ? t.accent : t.dateText }}>
                    {th.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Wallpaper Panel ── */}
      {showWallpaperPanel && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
          onClick={() => setShowWallpaperPanel(false)}
          >
          <div className="rounded-t-3xl w-full max-w-lg p-5 pt-4"
            style={{ background: t.surfaceSolid, border: `1px solid ${t.border}`, borderBottom: "none" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: t.border }} />
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base" style={{ color: t.otherBubbleText }}>Wallpaper Chuno</h2>
              <button onClick={() => setShowWallpaperPanel(false)} style={{ color: t.dateText }}>
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {WALLPAPERS.map((w) => (
                <button key={w.id} onClick={() => applyWallpaper(w.value)}
                  className="relative rounded-xl overflow-hidden h-20 transition-all duration-200 hover:scale-105"
                  style={{
                    background: w.value ? `url('${w.value}') center/cover` : t.bg,
                    border: `2px solid ${wallpaper === w.value ? t.accent : "transparent"}`,
                    transform: wallpaper === w.value ? "scale(0.95)" : "scale(1)",
                  }}>
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] text-white font-semibold bg-black/60 py-1">
                    {w.label}
                  </span>
                  {wallpaper === w.value && (
                    <span className="absolute top-1 right-1 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold"
                      style={{ background: t.accent, color: t.accentText }}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Custom image URL..."
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: t.inputBg, color: t.otherBubbleText, border: `1px solid ${t.border}` }} />
              <button onClick={() => customUrl.trim() && applyWallpaper(customUrl.trim())}
                disabled={!customUrl.trim()}
                className="px-4 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all hover:scale-105"
                style={{ background: t.sendBtn, color: "#fff" }}>
                Lagao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear Chat ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          onClick={() => setShowClearConfirm(false)}
          >
          <div className="rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            style={{ background: t.surfaceSolid, border: `1px solid ${t.border}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <Eraser className="size-7 text-red-400" />
              </div>
              <h2 className="font-bold text-lg" style={{ color: t.otherBubbleText }}>Chat Saaf Karo?</h2>
              <p className="text-[13px] text-center" style={{ color: t.dateText }}>Sirf aapke liye saaf hogi। Dusre ke paas rahegi।</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ border: `1px solid ${t.border}`, color: t.dateText }}>
                Cancel
              </button>
              <button onClick={clearChatForMe}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff" }}>
                Saaf Karo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center pb-8"
          onClick={() => setDeleteModal(null)}
          >
          <div className="rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl"
            style={{ background: t.surfaceSolid, border: `1px solid ${t.border}` }}
            onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-[11px] font-bold uppercase tracking-widest py-3"
              style={{ color: t.dateText, borderBottom: `1px solid ${t.border}` }}>
              Message Delete Karo
            </p>
            {deleteModal.mine && (
              <button onClick={() => deleteForEveryone(deleteModal.id)}
                className="w-full py-4 font-medium flex items-center justify-center gap-2 transition-colors hover:bg-red-500/10"
                style={{ color: "#f87171", borderBottom: `1px solid ${t.border}` }}>
                <Trash2 className="size-4" /> Sabke liye delete
              </button>
            )}
            <button onClick={() => deleteForMe(deleteModal.id)}
              className="w-full py-4 transition-colors hover:bg-white/5"
              style={{ color: t.otherBubbleText, borderBottom: `1px solid ${t.border}` }}>
              Sirf mere liye delete
            </button>
            <button onClick={() => setDeleteModal(null)}
              className="w-full py-3 text-sm transition-colors hover:bg-white/5"
              style={{ color: t.dateText }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Fullscreen Image ── */}
      {fullscreenImg && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setFullscreenImg(null)}>
          <button className="absolute top-4 right-4 p-2.5 rounded-xl transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
            onClick={() => setFullscreenImg(null)}>
            <X className="size-5" />
          </button>
          <img src={fullscreenImg} className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl" />
        </div>
      )}
    </div>
  );
}