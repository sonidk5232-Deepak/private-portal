"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Check, CheckCheck, Loader2, LogOut,
  Paperclip, Send, X, FileText, Download,
  Trash2, Image as ImageIcon, Reply, CornerUpLeft
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
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const [otherUser, setOtherUser]         = useState<any>(null);
  const [othersTyping, setOthersTyping]   = useState(false);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isAtBottom, setIsAtBottom]       = useState(true);
  const [replyTo, setReplyTo]             = useState<any>(null); // reply feature
  const [showWallpaperPanel, setShowWallpaperPanel] = useState(false);
  const [wallpaper, setWallpaper]         = useState<string>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("chat_wallpaper") || "") : ""
  );
  const [customUrl, setCustomUrl]         = useState("");

  const bottomRef        = useRef<HTMLDivElement>(null);
  const mainRef          = useRef<HTMLDivElement>(null);
  const fileInputRef     = useRef<HTMLInputElement>(null);
  const inputRef         = useRef<HTMLInputElement>(null);
  const longPressTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeout    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef      = useRef(false);
  const typingChRef      = useRef<any>(null);

  // ─── 1. Messages + Realtime ───────────────────────────────────────────────
  useEffect(() => {
    async function initChat() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setAllMessages(data);
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 100);
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
    if (allMessages.length > 0) markAsSeen();
  }, [allMessages, userId, supabase]);

  // ─── 3. Online / Last Seen ────────────────────────────────────────────────
  useEffect(() => {
    const setOnlineInDB = async (online: boolean) => {
      await supabase.from("profiles").upsert(
        { id: userId, username, is_online: online, last_seen_at: new Date().toISOString() },
        { onConflict: "id" }
      );
    };
    setOnlineInDB(true);

    const handleVisibility = () => setOnlineInDB(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", () => setOnlineInDB(false));

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

    const profileCh = supabase.channel("profiles-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        if (payload.new && (payload.new as any).id !== userId) setOtherUser(payload.new);
      }).subscribe();

    return () => {
      setOnlineInDB(false);
      document.removeEventListener("visibilitychange", handleVisibility);
      supabase.removeChannel(profileCh);
    };
  }, [userId, username, supabase]);

  // ─── 4. Typing — Broadcast ────────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel("typing-broadcast", {
      config: { broadcast: { self: false } },
    });

    ch.on("broadcast", { event: "typing" }, ({ payload }) => {
      if (!payload || payload.userId === userId) return;
      if (payload.isTyping) {
        setOthersTyping(true);
        if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
        typingClearTimer.current = setTimeout(() => setOthersTyping(false), 3000);
      } else {
        setOthersTyping(false);
        if (typingClearTimer.current) clearTimeout(typingClearTimer.current);
      }
    });

    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") typingChRef.current = ch;
    });

    return () => {
      supabase.removeChannel(ch);
      typingChRef.current = null;
    };
  }, [userId, supabase]);

  const handleTyping = useCallback((value: string) => {
    setDraft(value);
    if (!typingChRef.current) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      typingChRef.current.send({
        type: "broadcast", event: "typing",
        payload: { userId, isTyping: true },
      });
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false;
      typingChRef.current?.send({
        type: "broadcast", event: "typing",
        payload: { userId, isTyping: false },
      });
    }, 2000);
  }, [userId]);

  // ─── 5. Scroll + Unread ───────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
    if (atBottom) setUnreadCount(0);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
    setIsAtBottom(true);
  };

  // ─── 6. Send Message ──────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    setReplyTo(null);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    isTypingRef.current = false;
    typingChRef.current?.send({
      type: "broadcast", event: "typing",
      payload: { userId, isTyping: false },
    });

    const msgData: any = {
      user_id: userId, username, text,
      is_seen: false, deleted_for: [],
    };
    // Reply info save karo
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
      cancelFile();
      setReplyTo(null);
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

  // ─── 9. Reply — message par click karke jump karo ────────────────────────
  const jumpToMessage = (id: string) => {
    const el = document.getElementById(`msg-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-emerald-400", "ring-offset-1");
    setTimeout(() => el.classList.remove("ring-2", "ring-emerald-400", "ring-offset-1"), 1500);
  };

  // ─── 10. Helpers ──────────────────────────────────────────────────────────
  const formatLastSeen = (ts: string) => {
    if (!ts) return "";
    const d   = new Date(ts);
    const now = new Date();
    const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (sec < 30)   return "abhi abhi";
    if (sec < 60)   return `${sec} second pehle`;
    const min = Math.floor(sec / 60);
    if (min < 60)   return `${min} minute pehle`;
    const hr  = Math.floor(min / 60);
    if (hr  < 24)   return `aaj ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} ko`;
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    if (d.toDateString() === yest.toDateString())
      return `kal ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} ko`;
    return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ko`;
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

  // ─── 11. Render message content ───────────────────────────────────────────
  const renderContent = (m: any) => {
    if (m.file_type === "image") {
      return (
        <img src={m.file_url} alt={m.file_name}
          onClick={() => setFullscreenImg(m.file_url)}
          className="max-w-[220px] max-h-[280px] rounded-xl cursor-zoom-in object-cover block" />
      );
    }
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
    return <p className="text-[14px] leading-snug break-words">{m.text}</p>;
  };

  // ─── 12. Timeline ─────────────────────────────────────────────────────────
  const timeline = allMessages
    .filter((m) => !(m.deleted_for || []).includes(userId))
    .reduce((acc: any[], m: any, i: number, arr: any[]) => {
      const date     = new Date(m.created_at).toDateString();
      const prevDate = i > 0 ? new Date(arr[i - 1].created_at).toDateString() : null;
      if (date !== prevDate) {
        const today = new Date().toDateString();
        const yest  = new Date(Date.now() - 86400000).toDateString();
        const label = date === today ? "Aaj" : date === yest ? "Kal"
          : new Date(m.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
        acc.push({ kind: "date", key: "date-" + i, label });
      }
      acc.push({ kind: "message", message: m });
      return acc;
    }, []);

  // ─── 13. Header subtitle ──────────────────────────────────────────────────
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
    return (
      <span className="text-[11px] text-slate-500">
        Last seen {formatLastSeen(otherUser.last_seen_at)}
      </span>
    );
  };

  // ─── SQL check: reply columns exist karne chahiye ─────────────────────────
  // Run karo: ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id UUID,
  //           ADD COLUMN IF NOT EXISTS reply_to_text TEXT,
  //           ADD COLUMN IF NOT EXISTS reply_to_user TEXT;

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a] text-emerald-500">
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div className="flex h-[100dvh] flex-col text-slate-200 relative"
      style={{ background: wallpaper ? `url('${wallpaper}') center/cover no-repeat fixed` : "#0f172a" }}>

      {wallpaper && <div className="absolute inset-0 bg-black/45 pointer-events-none z-0" />}

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-slate-800 bg-[#1e293b]/95 backdrop-blur px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-bold text-emerald-400 text-lg tracking-tight leading-tight">Private Portal</h1>
          <div className="min-h-[16px] flex items-center">{headerSubtitle()}</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowWallpaperPanel(true)} title="Wallpaper"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <ImageIcon className="size-5" />
          </button>
          <LogOut onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            className="size-5 cursor-pointer text-slate-400 hover:text-white" />
        </div>
      </header>

      {/* ── Messages ── */}
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
            <div key={m.id} id={`msg-${m.id}`}
              className={`flex ${mine ? "justify-end" : "justify-start"} mb-1 group transition-all duration-300`}>

              {/* Reply button — hover par dikhta hai (left side ke message ke liye right, right ke liye left) */}
              {!mine && (
                <button
                  onClick={() => { setReplyTo(m); inputRef.current?.focus(); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity mr-1 mt-auto mb-2 p-1.5 rounded-full bg-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-600 self-end">
                  <CornerUpLeft className="size-3.5" />
                </button>
              )}

              <div
                onContextMenu={(e) => { e.preventDefault(); setDeleteModal({ id: m.id, mine }); }}
                onDoubleClick={() => { setReplyTo(m); inputRef.current?.focus(); }}
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

                {/* Reply preview */}
                {m.reply_to_id && (
                  <div
                    onClick={() => jumpToMessage(m.reply_to_id)}
                    className={`mb-1.5 px-2 py-1.5 rounded-lg border-l-2 border-emerald-400 cursor-pointer hover:opacity-80
                      ${mine ? "bg-emerald-800/50" : "bg-slate-700/60"}`}
                  >
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
                <button
                  onClick={() => { setReplyTo(m); inputRef.current?.focus(); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 mt-auto mb-2 p-1.5 rounded-full bg-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-600 self-end">
                  <CornerUpLeft className="size-3.5" />
                </button>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* ── Unread badge ── */}
      {unreadCount > 0 && !isAtBottom && (
        <button onClick={scrollToBottom}
          className="fixed bottom-24 right-4 z-40 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-3 py-2 text-sm font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
          <span>↓</span>
          <span>{unreadCount} naya</span>
        </button>
      )}

      {/* ── File Preview ── */}
      {selectedFile && (
        <div className="fixed bottom-[68px] left-0 right-0 bg-[#1e293b]/95 backdrop-blur border-t border-slate-700 p-3 z-40">
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

      {/* ── Footer — Reply bar + Input ── */}
      <footer className="fixed bottom-0 w-full border-t border-slate-800 bg-[#1e293b]/95 backdrop-blur z-50">

        {/* Reply bar */}
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

        <div className="mx-auto flex max-w-4xl gap-2 items-center p-3">
          <input ref={fileInputRef} type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            onChange={handleFileSelect} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-slate-700 rounded-full text-slate-300 hover:bg-slate-600 transition-colors">
            <Paperclip className="size-5" />
          </button>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !selectedFile && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-slate-900 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
          />
          <button onClick={selectedFile ? sendFile : sendMessage} disabled={uploading}
            className="bg-emerald-600 p-2.5 rounded-full hover:bg-emerald-500 shadow-lg transition-all active:scale-95 disabled:opacity-50">
            {uploading
              ? <Loader2 className="size-5 text-white animate-spin" />
              : <Send className="size-5 text-white" />}
          </button>
        </div>
      </footer>

      {/* ── Wallpaper Panel ── */}
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

      {/* ── Delete Modal ── */}
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