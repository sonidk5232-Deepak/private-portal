"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Check, CheckCheck, Loader2, LogOut,
  Paperclip, Send, X, FileText, Download,
  Trash2, Image as ImageIcon, Reply, CornerUpLeft,
  Eraser, Palette
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    name: "Dark",
    preview: ["#0f172a", "#1e293b", "#10b981"],
    bg: "#0f172a",
    surface: "#1e293b",
    surfaceHover: "#263548",
    border: "#334155",
    headerBg: "rgba(30,41,59,0.97)",
    inputBg: "#0f172a",
    myBubble: "rgba(16,185,129,0.88)",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(30,41,59,0.92)",
    otherBubbleText: "#e2e8f0",
    accent: "#10b981",
    accentText: "#ffffff",
    accentSoft: "rgba(16,185,129,0.15)",
    dateBg: "rgba(15,23,42,0.85)",
    dateText: "#94a3b8",
    time: "rgba(255,255,255,0.55)",
    sendBtn: "#10b981",
    // ✅ FIX: removed duplicate `name` property that was here
  },
  ocean: {
    name: "Ocean Blue",
    preview: ["#0a1628", "#0d2240", "#3b82f6"],
    bg: "#0a1628",
    surface: "#0d2240",
    surfaceHover: "#102a50",
    border: "#1e3a5f",
    headerBg: "rgba(13,34,64,0.97)",
    inputBg: "#071020",
    myBubble: "rgba(37,99,235,0.90)",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(13,34,64,0.95)",
    otherBubbleText: "#bfdbfe",
    accent: "#3b82f6",
    accentText: "#ffffff",
    accentSoft: "rgba(59,130,246,0.15)",
    dateBg: "rgba(10,22,40,0.85)",
    dateText: "#7dd3fc",
    time: "rgba(255,255,255,0.5)",
    sendBtn: "#2563eb",
  },
  purple: {
    name: "Purple Haze",
    preview: ["#0d0a1e", "#1a1035", "#8b5cf6"],
    bg: "#0d0a1e",
    surface: "#1a1035",
    surfaceHover: "#211545",
    border: "#2d1f50",
    headerBg: "rgba(26,16,53,0.97)",
    inputBg: "#080615",
    myBubble: "rgba(109,40,217,0.88)",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(26,16,53,0.95)",
    otherBubbleText: "#e9d5ff",
    accent: "#8b5cf6",
    accentText: "#ffffff",
    accentSoft: "rgba(139,92,246,0.15)",
    dateBg: "rgba(13,10,30,0.85)",
    dateText: "#c4b5fd",
    time: "rgba(255,255,255,0.5)",
    sendBtn: "#7c3aed",
  },
  rose: {
    name: "Rose Gold",
    preview: ["#1a0a0e", "#2d1018", "#f43f5e"],
    bg: "#1a0a0e",
    surface: "#2d1018",
    surfaceHover: "#3d1520",
    border: "#4d1a28",
    headerBg: "rgba(45,16,24,0.97)",
    inputBg: "#120608",
    myBubble: "rgba(225,29,72,0.85)",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(45,16,24,0.95)",
    otherBubbleText: "#fecdd3",
    accent: "#f43f5e",
    accentText: "#ffffff",
    accentSoft: "rgba(244,63,94,0.15)",
    dateBg: "rgba(26,10,14,0.85)",
    dateText: "#fda4af",
    time: "rgba(255,255,255,0.5)",
    sendBtn: "#e11d48",
  },
  teal: {
    name: "Teal Mint",
    preview: ["#021a18", "#042f2b", "#14b8a6"],
    bg: "#021a18",
    surface: "#042f2b",
    surfaceHover: "#073d37",
    border: "#0f4f48",
    headerBg: "rgba(4,47,43,0.97)",
    inputBg: "#011210",
    myBubble: "rgba(13,148,136,0.88)",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(4,47,43,0.95)",
    otherBubbleText: "#99f6e4",
    accent: "#14b8a6",
    accentText: "#ffffff",
    accentSoft: "rgba(20,184,166,0.15)",
    dateBg: "rgba(2,26,24,0.85)",
    dateText: "#5eead4",
    time: "rgba(255,255,255,0.5)",
    sendBtn: "#0d9488",
  },
  slate: {
    name: "Slate Pro",
    preview: ["#0f111a", "#161b2e", "#6366f1"],
    bg: "#0f111a",
    surface: "#161b2e",
    surfaceHover: "#1e2540",
    border: "#252d45",
    headerBg: "rgba(22,27,46,0.97)",
    inputBg: "#0a0c14",
    myBubble: "rgba(79,70,229,0.88)",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(22,27,46,0.95)",
    otherBubbleText: "#c7d2fe",
    accent: "#6366f1",
    accentText: "#ffffff",
    accentSoft: "rgba(99,102,241,0.15)",
    dateBg: "rgba(15,17,26,0.85)",
    dateText: "#a5b4fc",
    time: "rgba(255,255,255,0.5)",
    sendBtn: "#4f46e5",
  },
  amber: {
    name: "Amber Night",
    preview: ["#180e00", "#2a1800", "#f59e0b"],
    bg: "#180e00",
    surface: "#2a1800",
    surfaceHover: "#381f00",
    border: "#4a2b00",
    headerBg: "rgba(42,24,0,0.97)",
    inputBg: "#100900",
    myBubble: "rgba(217,119,6,0.88)",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(42,24,0,0.95)",
    otherBubbleText: "#fde68a",
    accent: "#f59e0b",
    accentText: "#000000",
    accentSoft: "rgba(245,158,11,0.15)",
    dateBg: "rgba(24,14,0,0.85)",
    dateText: "#fcd34d",
    time: "rgba(255,255,255,0.5)",
    sendBtn: "#d97706",
  },
  light: {
    name: "Light ☀️",
    preview: ["#f0f4f8", "#ffffff", "#0ea5e9"],
    bg: "#e8edf2",
    surface: "#ffffff",
    surfaceHover: "#f1f5f9",
    border: "#e2e8f0",
    headerBg: "rgba(255,255,255,0.97)",
    inputBg: "#f1f5f9",
    myBubble: "rgba(14,165,233,0.90)",
    myBubbleText: "#ffffff",
    otherBubble: "rgba(255,255,255,0.98)",
    otherBubbleText: "#1e293b",
    accent: "#0ea5e9",
    accentText: "#ffffff",
    accentSoft: "rgba(14,165,233,0.12)",
    dateBg: "rgba(226,232,240,0.90)",
    dateText: "#64748b",
    time: "rgba(0,0,0,0.4)",
    sendBtn: "#0284c7",
  },
} as const;

type ThemeKey = keyof typeof THEMES;

const WALLPAPERS = [
  { id: "none",      label: "Koi nahi",  value: "" },
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

  const [themeKey, setThemeKey] = useState<ThemeKey>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("chat_theme") as ThemeKey) || "dark";
  });
  const [wallpaper, setWallpaper] = useState<string>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("chat_wallpaper") || "") : ""
  );
  const [customUrl, setCustomUrl] = useState("");

  const t = THEMES[themeKey]; // current theme shortcut

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

  // ─── 2. Blue Tick ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAtBottom) return;
    const ids = allMessages.filter((m) => m.user_id !== userId && !m.is_seen).map((m) => m.id);
    if (ids.length > 0) supabase.from("messages").update({ is_seen: true }).in("id", ids);
  }, [allMessages, userId, supabase, isAtBottom]);

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

    const msgData: any = { user_id: userId, username, text, is_seen: false, deleted_for: [] };
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
        is_seen: false, deleted_for: [],
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

  const handleTouchStart = (id: string, mine: boolean) => {
    longPressTimer.current = setTimeout(() => setDeleteModal({ id, mine }), 600);
  };
  const handleTouchEnd = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); };

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
      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: t.accent }}>
        <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ backgroundColor: t.accent }} />
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

  if (loading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: t.bg }}>
      <Loader2 className="animate-spin" style={{ color: t.accent }} />
    </div>
  );

  return (
    <div className="flex h-[100dvh] flex-col relative" style={{
      background: wallpaper ? `url('${wallpaper}') center/cover no-repeat fixed` : t.bg,
      color: t.otherBubbleText,
    }}>
      {wallpaper && <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />}

      {/* ── Header ── */}
      <header className="relative z-10 px-4 py-3 flex justify-between items-center shrink-0 backdrop-blur"
        style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}` }}>
        <div className="flex flex-col gap-0.5">
          <h1 className="font-bold text-lg tracking-tight leading-tight" style={{ color: t.accent }}>
            Private Portal
          </h1>
          <div className="min-h-[16px] flex items-center">{headerSubtitle()}</div>
        </div>
        <div className="flex items-center gap-1">
          {/* Theme button */}
          <button onClick={() => setShowThemePanel(true)} title="Theme badlo"
            className="p-2 rounded-full transition-colors"
            style={{ color: t.dateText }}
            onMouseOver={(e) => (e.currentTarget.style.background = t.surfaceHover)}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
            <Palette className="size-5" />
          </button>
          <button onClick={() => setShowClearConfirm(true)} title="Chat saaf"
            className="p-2 rounded-full transition-colors"
            style={{ color: t.dateText }}
            onMouseOver={(e) => (e.currentTarget.style.background = t.surfaceHover)}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
            <Eraser className="size-5" />
          </button>
          <button onClick={() => setShowWallpaperPanel(true)} title="Wallpaper"
            className="p-2 rounded-full transition-colors"
            style={{ color: t.dateText }}
            onMouseOver={(e) => (e.currentTarget.style.background = t.surfaceHover)}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
            <ImageIcon className="size-5" />
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            className="p-2 rounded-full transition-colors"
            style={{ color: t.dateText }}
            onMouseOver={(e) => (e.currentTarget.style.background = t.surfaceHover)}
            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <main ref={mainRef} onScroll={handleScroll} className="relative z-10 flex-1 overflow-y-auto p-4 pb-36">
        {timeline.map((item: any) => {
          if (item.kind === "date") return (
            <div key={item.key} className="flex justify-center my-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur"
                style={{ background: t.dateBg, color: t.dateText }}>
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
                <div ref={firstUnreadRef} className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px" style={{ background: t.accent + "55" }} />
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap border"
                    style={{ color: t.accent, background: t.accentSoft, borderColor: t.accent + "44" }}>
                    ↓ {unreadCount} naye message
                  </span>
                  <div className="flex-1 h-px" style={{ background: t.accent + "55" }} />
                </div>
              )}

              <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-2 group`}>
                {!mine && (
                  <button onClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mr-1 self-end mb-1 p-1.5 rounded-full"
                    style={{ background: t.surface, color: t.dateText }}>
                    <CornerUpLeft className="size-3.5" />
                  </button>
                )}

                <div
                  id={`bubble-${m.id}`}
                  onContextMenu={(e) => { e.preventDefault(); setDeleteModal({ id: m.id, mine }); }}
                  onDoubleClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                  onTouchStart={() => handleTouchStart(m.id, mine)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  className="max-w-[85%] rounded-2xl px-3 py-2 shadow-md cursor-pointer select-none backdrop-blur-sm transition-all duration-300"
                  style={{
                    background: mine ? t.myBubble : t.otherBubble,
                    color: mine ? t.myBubbleText : t.otherBubbleText,
                    borderRadius: mine ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                    transform: isHighlighted ? "scale(1.02)" : "scale(1)",
                    boxShadow: isHighlighted ? `0 0 0 2px ${t.accent}` : "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {!mine && (
                    <p className="text-[10px] font-black mb-0.5 uppercase" style={{ color: t.accent }}>
                      {m.username}
                    </p>
                  )}

                  {m.reply_to_id && (
                    <div
                      onClick={(e) => { e.stopPropagation(); jumpToMessage(m.reply_to_id); }}
                      onTouchEnd={(e) => { e.stopPropagation(); jumpToMessage(m.reply_to_id); }}
                      className="mb-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-opacity active:opacity-60"
                      style={{
                        background: "rgba(0,0,0,0.2)",
                        borderLeft: `3px solid ${t.accent}`,
                      }}>
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: t.accent }}>
                        ↩ {m.reply_to_user === username ? "Aap" : m.reply_to_user}
                      </p>
                      <p className="text-[11px] opacity-75 truncate max-w-[200px]">{m.reply_to_text}</p>
                    </div>
                  )}

                  {renderContent(m)}

                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] font-medium" style={{ color: t.time }}>
                      {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                    {/* ✅ FIX: `t.themeKey` → `themeKey` (t is a theme object, not the key) */}
                    {mine && (m.is_seen
                      ? <CheckCheck className="size-3" style={{ color: themeKey === "light" ? "#0284c7" : "#60a5fa" }} />
                      : <Check className="size-3" style={{ color: t.time }} />
                    )}
                  </div>
                </div>

                {mine && (
                  <button onClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 self-end mb-1 p-1.5 rounded-full"
                    style={{ background: t.surface, color: t.dateText }}>
                    <CornerUpLeft className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* Unread badge */}
      {unreadCount > 0 && !isAtBottom && (
        <button onClick={scrollToBottom}
          className="fixed bottom-28 right-4 z-40 rounded-full pl-3 pr-4 py-2.5 text-sm font-bold shadow-xl flex items-center gap-2"
          style={{ background: t.accent, color: t.accentText }}>
          <span className="text-base">↓</span>
          <span>{unreadCount} naya</span>
        </button>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="fixed bottom-[72px] left-0 right-0 p-3 z-40 backdrop-blur"
          style={{ background: t.headerBg, borderTop: `1px solid ${t.border}` }}>
          <div className="mx-auto max-w-4xl flex items-center gap-3">
            {filePreview && selectedFile.type.startsWith("image/") && (
              <img src={filePreview} className="size-14 object-cover rounded-lg shrink-0" />
            )}
            {filePreview && selectedFile.type.startsWith("video/") && (
              <video src={filePreview} className="size-14 object-cover rounded-lg shrink-0" />
            )}
            {!filePreview && (
              <div className="size-14 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: t.surface }}>
                <FileText className="size-6" style={{ color: t.dateText }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs opacity-50">{formatSize(selectedFile.size)}</p>
            </div>
            <button onClick={cancelFile} className="p-1.5 rounded-full" style={{ color: t.dateText }}>
              <X className="size-4" />
            </button>
            <button onClick={sendFile} disabled={uploading}
              className="px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              style={{ background: t.sendBtn, color: "#fff" }}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {uploading ? "Bhej raha..." : "Bhejo"}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 w-full z-50 backdrop-blur"
        style={{ background: t.headerBg, borderTop: `1px solid ${t.border}` }}>
        {replyTo && (
          <div className="flex items-center gap-2 px-4 pt-2 pb-1"
            style={{ borderBottom: `1px solid ${t.border}` }}>
            <Reply className="size-4 shrink-0" style={{ color: t.accent }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold" style={{ color: t.accent }}>
                {replyTo.user_id === userId ? "Apne message ko" : replyTo.username + " ko"} reply
              </p>
              <p className="text-[11px] opacity-60 truncate">
                {replyTo.text || replyTo.file_name || "📎 File"}
              </p>
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
            className="p-2.5 rounded-full shrink-0 mb-0.5 transition-colors"
            style={{ background: t.surface, color: t.dateText }}>
            <Paperclip className="size-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 rounded-2xl px-4 py-2.5 outline-none text-sm resize-none overflow-hidden min-h-[42px] max-h-[120px] leading-relaxed"
            style={{
              background: t.inputBg,
              color: t.otherBubbleText,
              border: `1px solid ${t.border}`,
              height: "42px",
            }}
          />
          <button onClick={selectedFile ? sendFile : sendMessage} disabled={uploading}
            className="p-2.5 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50 shrink-0 mb-0.5"
            style={{ background: t.sendBtn, color: "#fff" }}>
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          </button>
        </div>
      </footer>

      {/* ── Theme Panel ── */}
      {showThemePanel && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
          onClick={() => setShowThemePanel(false)}>
          <div className="rounded-t-2xl w-full max-w-lg p-5"
            style={{ background: t.surface }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="font-bold text-lg" style={{ color: t.otherBubbleText }}>Theme Chuno</h2>
                <p className="text-xs mt-0.5" style={{ color: t.dateText }}>Apni pasand ka theme lagao</p>
              </div>
              <button onClick={() => setShowThemePanel(false)} style={{ color: t.dateText }}>
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, th]) => (
                <button key={key} onClick={() => applyTheme(key)}
                  className="flex flex-col items-center gap-2 p-2 rounded-2xl transition-all"
                  style={{
                    background: themeKey === key ? t.accentSoft : "transparent",
                    border: `2px solid ${themeKey === key ? t.accent : "transparent"}`,
                  }}>
                  {/* Color preview circles */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg"
                    style={{ background: th.bg }}>
                    <div className="absolute inset-0 flex flex-col justify-end p-1.5 gap-1">
                      <div className="self-start h-4 rounded-lg px-2 flex items-center text-[8px] font-medium"
                        style={{ background: th.otherBubble, color: th.otherBubbleText, maxWidth: "70%" }}>
                        Hi!
                      </div>
                      <div className="self-end h-4 rounded-lg px-2 flex items-center text-[8px] font-medium"
                        style={{ background: th.myBubble, color: th.myBubbleText, maxWidth: "70%" }}>
                        Hello
                      </div>
                    </div>
                    {themeKey === key && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: th.accent, color: th.accentText }}>✓</div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight"
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
          onClick={() => setShowWallpaperPanel(false)}>
          <div className="rounded-t-2xl w-full max-w-lg p-5"
            style={{ background: t.surface }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold" style={{ color: t.otherBubbleText }}>Wallpaper Chuno</h2>
              <button onClick={() => setShowWallpaperPanel(false)} style={{ color: t.dateText }}>
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {WALLPAPERS.map((w) => (
                <button key={w.id} onClick={() => applyWallpaper(w.value)}
                  className="relative rounded-xl overflow-hidden h-20 border-2 transition-all"
                  style={{
                    background: w.value ? `url('${w.value}') center/cover` : t.bg,
                    borderColor: wallpaper === w.value ? t.accent : "transparent",
                    transform: wallpaper === w.value ? "scale(0.95)" : "scale(1)",
                  }}>
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-white font-medium bg-black/50 py-0.5">
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
                placeholder="Custom image URL dalein..."
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: t.inputBg, color: t.otherBubbleText, border: `1px solid ${t.border}` }} />
              <button onClick={() => customUrl.trim() && applyWallpaper(customUrl.trim())}
                disabled={!customUrl.trim()} className="px-4 rounded-xl text-sm font-medium disabled:opacity-40"
                style={{ background: t.sendBtn, color: "#fff" }}>
                Lagao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear Chat ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={() => setShowClearConfirm(false)}>
          <div className="rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            style={{ background: t.surface }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.15)" }}>
                <Eraser className="size-6 text-red-400" />
              </div>
              <h2 className="font-bold text-lg" style={{ color: t.otherBubbleText }}>Chat Saaf Karo?</h2>
              <p className="text-sm text-center" style={{ color: t.dateText }}>
                Sirf aapke liye saaf hogi।
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ border: `1px solid ${t.border}`, color: t.dateText }}>
                Cancel
              </button>
              <button onClick={clearChatForMe}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 text-white">
                Saaf Karo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center pb-10"
          onClick={() => setDeleteModal(null)}>
          <div className="rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl"
            style={{ background: t.surface }}
            onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-sm py-3" style={{ color: t.dateText, borderBottom: `1px solid ${t.border}` }}>
              Message Delete Karo
            </p>
            {deleteModal.mine && (
              <button onClick={() => deleteForEveryone(deleteModal.id)}
                className="w-full py-4 text-red-400 font-medium hover:bg-red-500/10 flex items-center justify-center gap-2"
                style={{ borderBottom: `1px solid ${t.border}` }}>
                <Trash2 className="size-4" /> Sabke liye delete karo
              </button>
            )}
            <button onClick={() => deleteForMe(deleteModal.id)}
              className="w-full py-4 hover:bg-white/5"
              style={{ color: t.otherBubbleText, borderBottom: `1px solid ${t.border}` }}>
              Sirf mere liye delete karo
            </button>
            <button onClick={() => setDeleteModal(null)}
              className="w-full py-3 text-sm" style={{ color: t.dateText }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Fullscreen Image ── */}
      {fullscreenImg && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setFullscreenImg(null)}>
          <button className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full"
            onClick={() => setFullscreenImg(null)}>
            <X className="size-6" />
          </button>
          <img src={fullscreenImg} className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}