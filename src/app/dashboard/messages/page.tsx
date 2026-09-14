"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  ArrowLeft,
  Search,
  Info,
  Smile,
  Send,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

interface Conversation {
  id: string;
  partnerId: string;
  name: string;
  avatar: string;
  status: "Online" | "Offline";
  lastMessage: string;
  time: string;
  lastActivityAt: string;
  unreadCount?: number;
  messages: Message[];
  hasMoreMessages?: boolean;
  nextCursor?: string | null;
}

interface ConversationApiItem {
  id: string;
  partner: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  last_message: {
    content: string;
    created_at: string;
  } | null;
}

interface MessageApiItem {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  display_time: string;
}

interface MessagesPagination {
  hasMore: boolean;
  nextCursor: string | null;
}

interface SendMessageApiData {
  id: string;
  content: string;
  created_at: string;
  display_time: string;
}

interface RealtimeMessagePayload {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  display_time: string;
}

const EMOJI_LIST: string[] = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "😘",
  "😜",
  "🤩",
  "🥳",
  "😎",
  "🤗",
  "🤔",
  "🙄",
  "😴",
  "😭",
  "😢",
  "😡",
  "🥺",
  "😱",
  "👍",
  "👎",
  "🙏",
  "👏",
  "🔥",
  "💯",
  "🎉",
  "❤️",
  "💔",
  "✨",
  "😉",
  "😅",
];

// Jarak dari atas (px) yang memicu fetch pesan lama saat discroll
const LOAD_MORE_THRESHOLD_PX = 80;

function formatConversationTime(dateString?: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

  const [viewingChat, setViewingChat] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const activeIdRef = useRef(activeId);
  const partnerIdRef = useRef<string>("");
  const viewingChatRef = useRef(viewingChat);
  const isDesktopRef = useRef(false);

  // Pagination refs (dibaca langsung di scroll handler biar selalu up-to-date
  // tanpa perlu re-attach listener setiap kali state berubah)
  const hasMoreMessagesRef = useRef(false);
  const nextCursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const shouldScrollToBottomRef = useRef(false);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    viewingChatRef.current = viewingChat;
  }, [viewingChat]);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => {
      isDesktopRef.current = mql.matches;
    };
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Tutup emoji picker saat klik di luar area picker & tombolnya
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // Tutup emoji picker saat tombol Esc ditekan
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showEmojiPicker]);

  // Tutup emoji picker saat pindah percakapan
  useEffect(() => {
    setShowEmojiPicker(false);
  }, [activeId]);

  const isConversationVisible = (matchId: string) => {
    if (matchId !== activeIdRef.current) return false;
    if (isDesktopRef.current) return true;
    return viewingChatRef.current;
  };

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/conversations");

      if (res.status === 401) {
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Gagal memuat daftar percakapan.");
      }

      const json = await res.json();

      const firstItem = Array.isArray(json)
        ? json.find((item) => item?.data !== undefined)
        : json;
      const rawList: ConversationApiItem[] = firstItem?.data || [];

      const normalized: Conversation[] = rawList.map((item) => ({
        id: item.id,
        partnerId: item.partner?.id || "",
        name: item.partner?.full_name || item.partner?.username || "Unknown",
        avatar: item.partner?.avatar_url || "/profile.jpg",
        status: "Offline",
        lastMessage: item.last_message?.content || "Belum ada pesan",
        time: formatConversationTime(item.last_message?.created_at),
        lastActivityAt: item.last_message?.created_at || "",
        unreadCount: 0,
        messages: [],
        hasMoreMessages: false,
        nextCursor: null,
      }));

      setConversations(normalized);

      if (normalized.length > 0) {
        setActiveId((prev) => prev || normalized[0].id);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.",
      );
    } finally {
      setLoading(false);
    }
  };

  // options.before diisi -> mode "load more" (fetch pesan lebih lama).
  // options kosong -> mode "initial" (load 20 pesan terbaru, replace state).
  const fetchMessages = useCallback(
    async (
      matchId: string,
      partnerId: string,
      options?: { before?: string },
    ) => {
      const isLoadMore = !!options?.before;

      if (isLoadMore) {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMoreMessages(true);
      } else {
        setMessagesLoading(true);
        setMessagesError(null);
      }

      try {
        const url = isLoadMore
          ? `/api/conversations/${matchId}/messages?before=${encodeURIComponent(
              options!.before!,
            )}`
          : `/api/conversations/${matchId}/messages`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Gagal memuat pesan.");
        }

        const json = await res.json();

        const firstItem = Array.isArray(json)
          ? json.find((item) => item?.data !== undefined)
          : json;
        const rawMessages: MessageApiItem[] = firstItem?.data || [];
        const pagination: MessagesPagination = firstItem?.pagination || {
          hasMore: false,
          nextCursor: null,
        };

        const normalizedMessages: Message[] = rawMessages.map((msg) => ({
          id: msg.id,
          senderId: msg.sender_id === partnerId ? partnerId : "me",
          text: msg.content,
          timestamp: msg.display_time,
        }));

        // Simpan tinggi scroll SEBELUM pesan lama disisipkan, supaya posisi
        // scroll pengguna tidak "loncat" setelah list bertambah di atas.
        if (isLoadMore && messagesContainerRef.current) {
          prevScrollHeightRef.current =
            messagesContainerRef.current.scrollHeight;
        } else {
          shouldScrollToBottomRef.current = true;
        }

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== matchId) return conv;

            if (isLoadMore) {
              const existingIds = new Set(conv.messages.map((m) => m.id));
              const dedupedNew = normalizedMessages.filter(
                (m) => !existingIds.has(m.id),
              );

              return {
                ...conv,
                messages: [...dedupedNew, ...conv.messages],
                hasMoreMessages: pagination.hasMore,
                nextCursor: pagination.nextCursor,
              };
            }

            return {
              ...conv,
              messages: normalizedMessages,
              hasMoreMessages: pagination.hasMore,
              nextCursor: pagination.nextCursor,
            };
          }),
        );
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (isLoadMore) {
          toast.error("Gagal memuat pesan lama.");
        } else {
          setMessagesError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan tak terduga.",
          );
        }
      } finally {
        if (isLoadMore) {
          loadingMoreRef.current = false;
          setLoadingMoreMessages(false);
        } else {
          setMessagesLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeId) return;

    const conv = conversations.find((c) => c.id === activeId);
    if (!conv) return;

    fetchMessages(activeId, conv.partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, fetchMessages]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  // Sinkronkan info pagination percakapan aktif ke ref, dibaca oleh scroll handler
  useEffect(() => {
    hasMoreMessagesRef.current = activeConversation?.hasMoreMessages ?? false;
    nextCursorRef.current = activeConversation?.nextCursor ?? null;
    partnerIdRef.current = activeConversation?.partnerId ?? "";
  }, [
    activeConversation?.hasMoreMessages,
    activeConversation?.nextCursor,
    activeConversation?.partnerId,
  ]);

  // Jaga posisi scroll setelah pesan lama disisipkan, atau scroll ke bawah
  // saat pertama buka chat / kirim pesan baru.
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (shouldScrollToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
      shouldScrollToBottomRef.current = false;
      return;
    }

    if (prevScrollHeightRef.current > 0) {
      const diff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop = container.scrollTop + diff;
      prevScrollHeightRef.current = 0;
    }
  }, [activeConversation?.messages]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (
      container.scrollTop <= LOAD_MORE_THRESHOLD_PX &&
      hasMoreMessagesRef.current &&
      !loadingMoreRef.current
    ) {
      const matchId = activeIdRef.current;
      const partnerId = partnerIdRef.current;
      const cursor = nextCursorRef.current;

      if (matchId && partnerId && cursor) {
        fetchMessages(matchId, partnerId, { before: cursor });
      }
    }
  };

  const conversationIds = useMemo(
    () => conversations.map((c) => c.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversations.map((c) => c.id).join(",")],
  );

  useEffect(() => {
    if (conversationIds.length === 0) return;

    const channels = conversationIds.map((matchId) =>
      supabase
        .channel(`messages-${matchId}`)
        .on("broadcast", { event: "new_message" }, (payload) => {
          const newMessage = payload.payload as RealtimeMessagePayload;
          const visible = isConversationVisible(matchId);

          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id !== matchId) return conv;

              const isFromPartner = newMessage.sender_id === conv.partnerId;

              if (!isFromPartner && visible) {
                const pendingIndex = conv.messages.findIndex(
                  (m) =>
                    m.id.startsWith("temp-") && m.text === newMessage.content,
                );

                if (pendingIndex !== -1) {
                  const updatedMessages = [...conv.messages];
                  updatedMessages[pendingIndex] = {
                    id: newMessage.id,
                    senderId: "me",
                    text: newMessage.content,
                    timestamp: newMessage.display_time,
                  };

                  return {
                    ...conv,
                    lastMessage: newMessage.content,
                    time: newMessage.display_time,
                    lastActivityAt: newMessage.created_at,
                    messages: updatedMessages,
                  };
                }
              }

              const alreadyExists = conv.messages.some(
                (m) => m.id === newMessage.id,
              );

              if (visible && !alreadyExists) {
                shouldScrollToBottomRef.current = true;
              }

              const updatedMessages =
                visible && !alreadyExists
                  ? [
                      ...conv.messages,
                      {
                        id: newMessage.id,
                        senderId: isFromPartner ? conv.partnerId : "me",
                        text: newMessage.content,
                        timestamp: newMessage.display_time,
                      },
                    ]
                  : conv.messages;

              return {
                ...conv,
                lastMessage: newMessage.content,
                time: newMessage.display_time,
                lastActivityAt: newMessage.created_at,
                unreadCount:
                  isFromPartner && !visible
                    ? (conv.unreadCount || 0) + 1
                    : conv.unreadCount || 0,
                messages: updatedMessages,
              };
            }),
          );
        })
        .subscribe(),
    );

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationIds]);

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setViewingChat(true);
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, unreadCount: 0 } : conv)),
    );
  };

  const handleBackToList = () => {
    setViewingChat(false);
  };

  // Klik emoji hanya menambahkan ke input, TIDAK menutup panel.
  // Panel hanya ditutup lewat Esc atau klik di luar area panel/tombol.
  const handleEmojiSelect = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !activeId || isSending) return;

    setIsSending(true);
    setInputText("");

    const tempId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const optimisticMessage: Message = {
      id: tempId,
      senderId: "me",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    shouldScrollToBottomRef.current = true;

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId
          ? {
              ...conv,
              lastMessage: text,
              time: optimisticMessage.timestamp,
              lastActivityAt: nowIso,
              messages: [...conv.messages, optimisticMessage],
            }
          : conv,
      ),
    );

    try {
      const res = await fetch(`/api/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengirim pesan.");
      }

      const json = await res.json();

      const firstItem = Array.isArray(json)
        ? json.find((item) => item?.data !== undefined)
        : json;
      const sentMessage: SendMessageApiData | undefined = firstItem?.data;

      if (sentMessage) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeId
              ? {
                  ...conv,
                  lastMessage: sentMessage.content,
                  time: sentMessage.display_time,
                  lastActivityAt: sentMessage.created_at,
                  messages: conv.messages.map((msg) =>
                    msg.id === tempId
                      ? {
                          id: sentMessage.id,
                          senderId: "me",
                          text: sentMessage.content,
                          timestamp: sentMessage.display_time,
                        }
                      : msg,
                  ),
                }
              : conv,
          ),
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Gagal mengirim pesan. Silakan coba lagi.");

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeId
            ? {
                ...conv,
                messages: conv.messages.filter((msg) => msg.id !== tempId),
              }
            : conv,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
    const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className="fixed inset-x-0 top-[60px] bottom-[52px] z-10 flex bg-white md:bottom-0">
      {/* Sidebar Kiri: Daftar Chat */}
      <div
        className={`${
          viewingChat ? "hidden" : "flex"
        } w-full shrink-0 flex-col border-r bg-slate-50/50 md:flex md:w-80 lg:w-96`}
      >
        <div className="shrink-0 border-b p-4 space-y-3">
          <h1 className="text-xl font-bold text-slate-800">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations"
              className="rounded-xl border-slate-200 bg-white pl-10 text-sm focus-visible:ring-indigo-400"
            />
          </div>
        </div>

        {loading && (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat percakapan...
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConversations}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        )}

        {!loading && !error && sortedConversations.length === 0 && (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-400">
            Belum ada percakapan.
          </div>
        )}

        {!loading && !error && sortedConversations.length > 0 && (
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {sortedConversations.map((item) => {
              const isActive = item.id === activeId;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectConversation(item.id)}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-2xl p-3.5 transition-all ${
                    isActive
                      ? "border border-indigo-100/60 bg-indigo-50/80 shadow-sm"
                      : "hover:bg-slate-100/70"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11 border">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback>{item.name[0]}</AvatarFallback>
                    </Avatar>
                    {item.status === "Online" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h2
                        className={`truncate text-sm ${
                          isActive
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-700"
                        }`}
                      >
                        {item.name}
                      </h2>
                      <span
                        className={`text-xs ${
                          isActive
                            ? "font-medium text-indigo-600"
                            : "text-slate-400"
                        }`}
                      >
                        {item.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-slate-500">
                        {item.lastMessage}
                      </p>
                      {!!item.unreadCount && (
                        <span className="flex h-4 min-w-[1rem] shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Area Chat Utama */}
      {activeConversation ? (
        <div
          className={`${
            viewingChat ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col bg-white md:flex`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackToList}
                className="mr-1 shrink-0 text-slate-500 hover:text-slate-700 md:hidden"
                aria-label="Kembali ke daftar percakapan"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="relative">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage
                    src={activeConversation.avatar}
                    alt={activeConversation.name}
                  />
                  <AvatarFallback>{activeConversation.name[0]}</AvatarFallback>
                </Avatar>
                {activeConversation.status === "Online" && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  {activeConversation.name}
                </h2>
                <span className="text-[11px] font-medium text-emerald-600">
                  {activeConversation.status}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-400 hover:text-slate-600"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>

          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {messagesLoading && (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat pesan...
              </div>
            )}

            {!messagesLoading && messagesError && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-red-600">{messagesError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    fetchMessages(
                      activeConversation.id,
                      activeConversation.partnerId,
                    )
                  }
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </Button>
              </div>
            )}

            {!messagesLoading && !messagesError && loadingMoreMessages && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Memuat pesan lama...
              </div>
            )}

            {!messagesLoading &&
              !messagesError &&
              activeConversation.messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Belum ada pesan. Mulai percakapan sekarang.
                </div>
              )}

            {!messagesLoading &&
              !messagesError &&
              activeConversation.messages.map((msg) => {
                const isMe = msg.senderId === "me";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isMe && (
                      <Avatar className="mb-4 h-8 w-8 shrink-0 border">
                        <AvatarImage src={activeConversation.avatar} />
                        <AvatarFallback>
                          {activeConversation.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`flex max-w-[70%] flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                          isMe
                            ? "rounded-br-xs bg-indigo-600 text-white shadow-sm shadow-indigo-100"
                            : "rounded-bl-xs bg-slate-100 text-slate-800"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="mt-1 flex items-center gap-1 px-1">
                        <span className="text-[11px] text-slate-400">
                          {msg.timestamp}
                        </span>
                        {isMe && (
                          <span className="text-xs font-bold text-indigo-600">
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="relative shrink-0 border-t bg-white p-4">
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full left-4 z-20 mb-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg"
              >
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-slate-100"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-2 pl-4 transition-all focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-400"
            >
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                disabled={isSending}
                className="border-0 bg-transparent p-0 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  ref={emojiButtonRef}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className={`h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 ${
                    showEmojiPicker ? "bg-slate-200 text-slate-600" : ""
                  }`}
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || !inputText.trim()}
                  className="h-9 w-9 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center text-slate-400 md:flex">
          {loading ? "Memuat..." : "Pilih percakapan untuk memulai percakapan."}
        </div>
      )}
    </div>
  );
}
