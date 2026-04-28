"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Check, CheckCheck, Loader2, LogOut,
  Paperclip, Send, X, FileText, Download,
  Trash2, Image as ImageIcon, Reply, CornerUpLeft, Eraser
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

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
  const [isAtBottom, setIsAtBottom]       = useState(true);
  const [replyTo, setReplyTo]             = useState<any>(null);
  const [showWallpaperPanel, setShowWallpaperPanel] = useState(false);
  const [lastSeenTimer, setLastSeenTimer] = useState(0); // force re-render for live last seen
  const [wallpaper, setWallpaper]         = useState<string>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("chat_wallpaper") || "") : ""
  );
  const [customUrl, setCustomUrl] = useState("");

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

  // ─── Last seen live update (har 30 sec mein re-render) ───────────────────
  useEffect(() => {
    const interval = setInterval(() => setLastSeenTimer((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Auto resize textarea ─────────────────────────────────────────────────
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
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) {
        setAllMessages(data);

        // ✅ FIX: Portal kholte hi unseen messages dhundo
        const unseenMsgs = data.filter((m) => m.user_id !== userId && !m.is_seen);
        if (unseenMsgs.length > 0) {
          setUnreadCount(unseenMsgs.length);
          firstUnreadId.current = unseenMsgs[0].id;
          // Pehle unseen message tak scroll karo
          setTimeout(() => {
            firstUnreadRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
          }, 150);
        } else {
          // Koi unseen nahi — bottom par jao
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
          setAllMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m))
          );
        } else if (payload.eventType === "DELETE") {
          setAllMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, userId]);

  // ─── 2. Blue Tick ─────────────────────────────────────────────────────────
  useEffect(() => {
    const markAsSeen = async () => {
      const unreadIds = allMessages
        .filter((m) => m.user_id !== userId && !m.is_seen)
        .map((m) => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("messages").update({ is_seen: true }).in("id", unreadIds);
      }
    };
    if (allMessages.length > 0 && isAtBottom) markAsSeen();
  }, [allMessages, userId, supabase, isAtBottom]);

  // ─── 3. Online / Last Seen ────────────────────────────────────────────────
  // ✅ FIX: goOnline mein last_seen_at bilkul mat chheena
  //         Sirf goOffline mein last_seen_at set karo
  useEffect(() => {
    const goOnline = async () => {
      // Pehle check karo profile exist karta hai ya nahi
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, last_seen_at")
        .eq("id", userId)
        .maybeSingle();

      if (existing) {
        // Profile hai — sirf is_online true karo, last_seen_at mat chheena
        await supabase.from("profiles")
          .update({ is_online: true, username })
          .eq("id", userId);
      } else {
        // Naya profile banao
        await supabase.from("profiles").insert({
          id: userId, username,
          is_online: true,
          last_seen_at: null,
        });
      }
    };

    const goOffline = async () => {
      await supabase.from("profiles")
        .update({
          is_online: false,
          last_seen_at: new Date().toISOString(), // ✅ Sirf yahan set karo
        })
        .eq("id", userId);
    };

    goOnline();

    const handleVisibility = () => {
      if (document.hidden) goOffline();
      else goOnline();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", goOffline);

    // Doosre user ka data lo
    const fetchOther = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, is_online, last_seen_at")
        .neq("id", userId)
        .limit(1)
        .maybeSingle();
      if (data) setOtherUser(data);
    };
    fetchOther();

    // Realtime profile watch
    const profileCh = supabase.channel("profiles-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        if (payload.new && (payload.new as any).id !== userId) {
          setOtherUser(payload.new);
        }
      }).subscribe();

    return () => {
      goOffline();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", goOffline);
      supabase.removeChannel(profileCh);
    };
  }, [userId, username, supabase]);

  // ─── 4. Typing Broadcast ──────────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel("typing-v3", {
      config: { broadcast: { self: false, ack: false } },
    });

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

    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") typingChRef.current = ch;
    });

    return () => {
      typingChRef.current = null;
      supabase.removeChannel(ch);
    };
  }, [userId, supabase]);

  const sendTypingSignal = useCallback((isTyping: boolean) => {
    typingChRef.current?.send({
      type: "broadcast", event: "typing",
      payload: { userId, isTyping },
    });
  }, [userId]);

  const handleTyping = useCallback((value: string) => {
    setDraft(value);
    setTimeout(autoResize, 0);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingSignal(true);
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingSignal(false);
    }, 2000);
  }, [sendTypingSignal]);

  // ─── 5. Scroll + Unread ───────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setUnreadCount(0);
      firstUnreadId.current = null;
    }
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
    firstUnreadId.current = null;
    setIsAtBottom(true);
  };

  // ─── 6. Send Message ──────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    setReplyTo(null);
    if (textareaRef.current) textareaRef.current.style.height = "42px";

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    isTypingRef.current = false;
    sendTypingSignal(false);

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
    if (file.size > 25 * 1024 * 1024) { alert("File 25MB se badi nahi honi chahiye!"); return; }
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
      const { data: urlData } = await supabase.storage
        .from("chat-files").createSignedUrl(filePath, 60 * 60 * 24 * 365);

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
    // Sabke messages mein apna userId deleted_for mein daalo
    const visibleMsgs = allMessages.filter((m) => !(m.deleted_for || []).includes(userId));
    for (const m of visibleMsgs) {
      const updated = [...(m.deleted_for || []), userId];
      await supabase.from("messages").update({ deleted_for: updated }).eq("id", m.id);
    }
    setAllMessages((prev) =>
      prev.map((m) => ({
        ...m,
        deleted_for: [...(m.deleted_for || []), userId],
      }))
    );
    setShowClearConfirm(false);
  };

  // ─── 10. Jump to reply ────────────────────────────────────────────────────
  const jumpToMessage = (id: string) => {
    const el = document.getElementById(`msg-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-emerald-400");
    setTimeout(() => el.classList.remove("ring-2", "ring-emerald-400"), 1500);
  };

  // ─── 11. Helpers ──────────────────────────────────────────────────────────
  // ✅ FIX: Accurate last seen — lastSeenTimer se live update hoga
  const formatLastSeen = (ts: string) => {
    if (!ts) return "pehle";
    const d   = new Date(ts);
    const now = new Date();
    const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (sec < 30)   return "abhi abhi";
    if (sec < 60)   return `${sec} second pehle`;
    const min = Math.floor(sec / 60);
    if (min < 60)   return `${min} minute pehle`;
    const hr  = Math.floor(min / 60);
    if (hr < 24)    return `aaj ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} ko`;
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
    setWallpaper(url);
    localStorage.setItem("chat_wallpaper", url);
    setShowWallpaperPanel(false);
    setCustomUrl("");
  };

  const handleTouchStart = (id: string, mine: boolean) => {
    longPressTimer.current = setTimeout(() => setDeleteModal({ id, mine }), 600);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  // ─── 12. Render content ───────────────────────────────────────────────────
  const renderContent = (m: any) => {
    if (m.file_type === "image") return (
      <img src={m.file_url} alt={m.file_name}
        onClick={() => setFullscreenImg(m.file_url)}
        className="max-w-[220px] max-h-[280px] rounded-xl cursor-zoom-in object-cover block" />
    );
    if (m.file_type === "video") return (
      <video controls className="max-w-[240px] max-h-[280px] rounded-xl block">
        <source src={m.file_url} />
      </video>
    );
    if (m.file_type === "audio") return (
      <audio controls className="w-[200px]"><source src={m.file_url} /></audio>
    );
    if (m.file_url && m.file_type === "file") return (
      <a href={m.file_url} target="_blank" rel="noreferrer"
        className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 no-underline hover:bg-black/30 transition-colors">
        <FileText className="size-8 text-slate-300 shrink-0" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-white truncate max-w-[160px]">{m.file_name}</p>
          <p className="text-[10px] text-slate-300">{formatSize(m.file_size)}</p>
        </div>
        <Download className="size-4 text-slate-300 shrink-0" />
      </a>
    );
    return <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{m.text}</p>;
  };

  // ─── 13. Timeline ─────────────────────────────────────────────────────────
  const visibleMessages = allMessages.filter((m) => !(m.deleted_for || []).includes(userId));

  const timeline = visibleMessages.reduce((acc: any[], m: any, i: number, arr: any[]) => {
    const date     = new Date(m.created_at).toDateString();
    const prevDate = i > 0 ? new Date(arr[i - 1].created_at).toDateString() : null;
    if (date !== prevDate) {
      const today = new Date().toDateString();
      const yest  = new Date(Date.now() - 86400000).toDateString();
      const label = date === today ? "Aaj" : date === yest ? "Kal"
        : new Date(m.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      acc.push({ kind: "date", key: "date-" + i, label });
    }
    acc.push({ kind: "message", message: m, isFirstUnread: m.id === firstUnreadId.current });
    return acc;
  }, []);

  // ─── 14. Header subtitle ──────────────────────────────────────────────────
  const headerSubtitle = () => {
    if (othersTyping) return (
      <span className="text-emerald-400 text-[11px] flex items-center gap-1.5">
        <span className="flex gap-[3px] items-end">
          {[0, 150, 300].map((d) => (
            <span key={d} className="w-[5px] h-[5px] bg-emerald-400 rounded-full animate-bounce"
              style={{ animationDelay: `${d}ms`, animationDuration: "0.8s" }} />
          ))}
        </span>
        typing...
      </span>
    );
    if (!otherUser) return null;
    if (otherUser.is_online) return (
      <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
        Online
      </span>
    );
    if (!otherUser.last_seen_at) return null;
    // lastSeenTimer se live update hoga
    return (
      <span key={lastSeenTimer} className="text-[11px] text-slate-500">
        Last seen {formatLastSeen(otherUser.last_seen_at)}
      </span>
    );
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a] text-emerald-500">
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div className="flex h-[100dvh] flex-col text-slate-200 relative"
      style={{ background: wallpaper ? `url('${wallpaper}') center/cover no-repeat fixed` : "#0f172a" }}>

      {wallpaper && <div className="absolute inset-0 bg-black/45 pointer-events-none z-0" />}

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-[#1e293b]/95 backdrop-blur px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-bold text-emerald-400 text-lg tracking-tight leading-tight">Private Portal</h1>
          <div className="min-h-[16px] flex items-center">{headerSubtitle()}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Clear Chat Button */}
          <button onClick={() => setShowClearConfirm(true)} title="Chat saaf karo"
            className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors">
            <Eraser className="size-5" />
          </button>
          <button onClick={() => setShowWallpaperPanel(true)} title="Wallpaper"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <ImageIcon className="size-5" />
          </button>
          <LogOut onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            className="size-5 cursor-pointer text-slate-400 hover:text-white" />
        </div>
      </header>

      {/* Messages */}
      <main ref={mainRef} onScroll={handleScroll}
        className="relative z-10 flex-1 overflow-y-auto p-4 space-y-1 pb-36">

        {timeline.map((item: any) => {
          if (item.kind === "date") return (
            <div key={item.key} className="flex justify-center my-4">
              <span className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {item.label}
              </span>
            </div>
          );

          const m    = item.message;
          const mine = m.user_id === userId;

          return (
            <div key={m.id}>
              {/* ✅ Unread divider */}
              {item.isFirstUnread && (
                <div ref={firstUnreadRef} className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-emerald-500/40" />
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full">
                    {unreadCount} naye message
                  </span>
                  <div className="flex-1 h-px bg-emerald-500/40" />
                </div>
              )}

              <div id={`msg-${m.id}`}
                className={`flex ${mine ? "justify-end" : "justify-start"} mb-1 group transition-all duration-300`}>

                {!mine && (
                  <button onClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mr-1 self-end mb-2 p-1.5 rounded-full bg-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-600">
                    <CornerUpLeft className="size-3.5" />
                  </button>
                )}

                <div
                  onContextMenu={(e) => { e.preventDefault(); setDeleteModal({ id: m.id, mine }); }}
                  onDoubleClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                  onTouchStart={() => handleTouchStart(m.id, mine)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm cursor-pointer select-none backdrop-blur-sm
                    ${mine
                      ? "bg-emerald-700/90 rounded-tr-none text-white"
                      : "bg-slate-800/90 rounded-tl-none text-slate-100"
                    }`}
                >
                  {!mine && <p className="text-[10px] font-black text-emerald-400 mb-0.5 uppercase">{m.username}</p>}

                  {m.reply_to_id && (
                    <div onClick={() => jumpToMessage(m.reply_to_id)}
                      className={`mb-1.5 px-2 py-1.5 rounded-lg border-l-2 border-emerald-400 cursor-pointer hover:opacity-80
                        ${mine ? "bg-emerald-800/50" : "bg-slate-700/60"}`}>
                      <p className="text-[10px] font-bold text-emerald-400 mb-0.5">
                        {m.reply_to_user === username ? "Aap" : m.reply_to_user}
                      </p>
                      <p className="text-[11px] opacity-80 truncate max-w-[200px]">{m.reply_to_text}</p>
                    </div>
                  )}

                  {renderContent(m)}

                  <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                    <span className="text-[9px] font-medium">
                      {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                    {mine && (m.is_seen
                      ? <CheckCheck className="size-3 text-blue-400" />
                      : <Check className="size-3 text-slate-300" />
                    )}
                  </div>
                </div>

                {mine && (
                  <button onClick={() => { setReplyTo(m); textareaRef.current?.focus(); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 self-end mb-2 p-1.5 rounded-full bg-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-600">
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
          className="fixed bottom-28 right-4 z-40 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-3 py-2 text-sm font-bold shadow-lg flex items-center gap-1.5">
          ↓ {unreadCount} naya
        </button>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="fixed bottom-[72px] left-0 right-0 bg-[#1e293b]/95 backdrop-blur border-t border-slate-700 p-3 z-40">
          <div className="mx-auto max-w-4xl flex items-center gap-3">
            {filePreview && selectedFile.type.startsWith("image/") && (
              <img src={filePreview} className="size-14 object-cover rounded-lg shrink-0" />
            )}
            {filePreview && selectedFile.type.startsWith("video/") && (
              <video src={filePreview} className="size-14 object-cover rounded-lg shrink-0" />
            )}
            {!filePreview && (
              <div className="size-14 bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="size-6 text-slate-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{formatSize(selectedFile.size)}</p>
            </div>
            <button onClick={cancelFile} className="p-1.5 rounded-full hover:bg-slate-600 text-slate-400">
              <X className="size-4" />
            </button>
            <button onClick={sendFile} disabled={uploading}
              className="bg-emerald-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {uploading ? "Bhej raha..." : "Bhejo"}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 w-full border-t border-slate-800 bg-[#1e293b]/95 backdrop-blur z-50">
        {replyTo && (
          <div className="flex items-center gap-2 px-4 pt-2 pb-1 border-b border-slate-700/50">
            <Reply className="size-4 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-emerald-400">
                {replyTo.user_id === userId ? "Apne message ko" : replyTo.username + " ko"} reply
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {replyTo.text || replyTo.file_name || "📎 File"}
              </p>
            </div>
            <button onClick={() => setReplyTo(null)} className="p-1 text-slate-500 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="mx-auto flex max-w-4xl gap-2 items-end p-3">
          <input ref={fileInputRef} type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            onChange={handleFileSelect} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-slate-700 rounded-full text-slate-300 hover:bg-slate-600 transition-colors shrink-0 mb-0.5">
            <Paperclip className="size-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-slate-900 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm resize-none overflow-hidden min-h-[42px] max-h-[120px] leading-relaxed"
            style={{ height: "42px" }}
          />
          <button onClick={selectedFile ? sendFile : sendMessage} disabled={uploading}
            className="bg-emerald-600 p-2.5 rounded-full hover:bg-emerald-500 shadow-lg transition-all active:scale-95 disabled:opacity-50 shrink-0 mb-0.5">
            {uploading
              ? <Loader2 className="size-5 text-white animate-spin" />
              : <Send className="size-5 text-white" />}
          </button>
        </div>
      </footer>

      {/* Clear Chat Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={() => setShowClearConfirm(false)}>
          <div className="bg-[#1e293b] rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <Eraser className="size-6 text-red-400" />
              </div>
              <h2 className="font-bold text-white text-lg">Chat Saaf Karo?</h2>
              <p className="text-sm text-slate-400 text-center">
                Sirf aapke liye chat saaf hogi। Doosre user ke paas messages rahenge।
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button onClick={clearChatForMe}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors text-sm font-medium">
                Saaf Karo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallpaper Panel */}
      {showWallpaperPanel && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
          onClick={() => setShowWallpaperPanel(false)}>
          <div className="bg-[#1e293b] rounded-t-2xl w-full max-w-lg p-5"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-white">Wallpaper Chuno</h2>
              <button onClick={() => setShowWallpaperPanel(false)}><X className="size-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {WALLPAPERS.map((w) => (
                <button key={w.id} onClick={() => applyWallpaper(w.value)}
                  className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all
                    ${wallpaper === w.value ? "border-emerald-400 scale-95" : "border-transparent hover:border-slate-500"}`}
                  style={{ background: w.value ? `url('${w.value}') center/cover` : "#0f172a" }}>
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-white font-medium bg-black/50 py-0.5">
                    {w.label}
                  </span>
                  {wallpaper === w.value && (
                    <span className="absolute top-1 right-1 bg-emerald-400 rounded-full w-4 h-4 flex items-center justify-center text-[9px] text-black font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Custom image URL dalein..."
                className="flex-1 bg-slate-900 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
              <button onClick={() => customUrl.trim() && applyWallpaper(customUrl.trim())}
                disabled={!customUrl.trim()}
                className="bg-emerald-600 px-4 rounded-xl text-sm font-medium hover:bg-emerald-500 disabled:opacity-40">
                Lagao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center pb-10"
          onClick={() => setDeleteModal(null)}>
          <div className="bg-[#1e293b] rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-sm text-slate-400 py-3 border-b border-slate-700">Message Delete Karo</p>
            {deleteModal.mine && (
              <button onClick={() => deleteForEveryone(deleteModal.id)}
                className="w-full py-4 text-red-400 font-medium hover:bg-slate-700/50 flex items-center justify-center gap-2 border-b border-slate-700">
                <Trash2 className="size-4" /> Sabke liye delete karo
              </button>
            )}
            <button onClick={() => deleteForMe(deleteModal.id)}
              className="w-full py-4 text-slate-300 hover:bg-slate-700/50 border-b border-slate-700">
              Sirf mere liye delete karo
            </button>
            <button onClick={() => setDeleteModal(null)}
              className="w-full py-3 text-slate-500 hover:bg-slate-700/50 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Image */}
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