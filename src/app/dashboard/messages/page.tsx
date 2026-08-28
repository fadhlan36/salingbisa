"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Info,
  Smile,
  Paperclip,
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
  unreadCount?: number;
  messages: Message[];
}

// Bentuk mentah dari response API GET /api/conversations
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

// Bentuk mentah dari response API GET /api/conversations/:matchId/messages
interface MessageApiItem {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  display_time: string;
}

// Bentuk mentah data dari response POST /api/conversations/:matchId/messages
interface SendMessageApiData {
  id: string;
  content: string;
  created_at: string;
  display_time: string;
}

// Bentuk payload broadcast realtime dari server (bukan row Postgres mentah,
// karena kita pakai Broadcast, bukan postgres_changes)
interface RealtimeMessagePayload {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  display_time: string;
}

// Format waktu relatif sederhana untuk ditampilkan di list chat
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

      // Response berformat array: [{ message, data }, { status }]
      const firstItem = Array.isArray(json)
        ? json.find((item) => item?.data !== undefined)
        : json;
      const rawList: ConversationApiItem[] = firstItem?.data || [];

      const normalized: Conversation[] = rawList.map((item) => ({
        id: item.id,
        partnerId: item.partner?.id || "",
        name: item.partner?.full_name || item.partner?.username || "Unknown",
        avatar: item.partner?.avatar_url || "/profile.png",
        // TODO: API belum mengirim status online/offline partner, sementara default "Offline"
        status: "Offline",
        lastMessage: item.last_message?.content || "Belum ada pesan",
        time: formatConversationTime(item.last_message?.created_at),
        messages: [],
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

  // Fetch history pesan penuh untuk 1 percakapan berdasarkan matchId
  const fetchMessages = useCallback(
    async (matchId: string, partnerId: string) => {
      setMessagesLoading(true);
      setMessagesError(null);

      try {
        const res = await fetch(`/api/conversations/${matchId}/messages`);

        if (!res.ok) {
          throw new Error("Gagal memuat pesan.");
        }

        const json = await res.json();

        // Response berformat array: [{ message, data }, { status }]
        const firstItem = Array.isArray(json)
          ? json.find((item) => item?.data !== undefined)
          : json;
        const rawMessages: MessageApiItem[] = firstItem?.data || [];

        const normalizedMessages: Message[] = rawMessages.map((msg) => ({
          id: msg.id,
          // Bandingkan sender_id dengan partnerId: jika sama, berarti pesan dari
          // partner; jika beda, berarti pesan dari kita sendiri.
          senderId: msg.sender_id === partnerId ? partnerId : "me",
          text: msg.content,
          timestamp: msg.display_time,
        }));

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === matchId
              ? { ...conv, messages: normalizedMessages }
              : conv,
          ),
        );
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessagesError(
          err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.",
        );
      } finally {
        setMessagesLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch history pesan setiap kali percakapan aktif berubah
  useEffect(() => {
    if (!activeId) return;

    const conv = conversations.find((c) => c.id === activeId);
    if (!conv) return;

    fetchMessages(activeId, conv.partnerId);
    // Sengaja tidak memasukkan `conversations` ke dependency array supaya
    // tidak fetch ulang setiap kali state conversations berubah (misal saat
    // mengirim pesan baru).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, fetchMessages]);

  // Subscribe realtime ke pesan baru untuk percakapan yang sedang aktif.
  // Pakai Broadcast (bukan postgres_changes) karena browser client Supabase
  // di sini tidak terautentikasi lewat Supabase Auth (auth custom JWT
  // sendiri), sehingga RLS akan selalu memblokir postgres_changes.
  // Subscribe realtime ke pesan baru untuk percakapan yang sedang aktif.
  // Pakai Broadcast (bukan postgres_changes) karena browser client Supabase
  // di sini tidak terautentikasi lewat Supabase Auth (auth custom JWT
  // sendiri), sehingga RLS akan selalu memblokir postgres_changes.
  useEffect(() => {
    if (!activeId) return;

    const channel = supabase
      .channel(`messages-${activeId}`)
      .on("broadcast", { event: "new_message" }, (payload) => {
        const newMessage = payload.payload as RealtimeMessagePayload;

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== activeId) return conv;

            // Kalau pesan dengan id ini sudah ada di state, abaikan
            // (mencegah duplikat kalau broadcast datang setelah response POST).
            const alreadyExists = conv.messages.some(
              (m) => m.id === newMessage.id,
            );
            if (alreadyExists) return conv;

            const isFromPartner = newMessage.sender_id === conv.partnerId;

            if (!isFromPartner) {
              // Broadcast ini adalah pesan yang kita kirim sendiri. Karena
              // kita juga subscribe ke channel kita sendiri, broadcast bisa
              // datang SEBELUM response POST selesai. Kalau ada pesan optimis
              // (id sementara "temp-...") dengan teks yang sama, ganti id-nya
              // saja supaya tidak duplikat saat response POST datang belakangan.
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
                  messages: updatedMessages,
                };
              }
            }

            const incomingMessage: Message = {
              id: newMessage.id,
              senderId: isFromPartner ? conv.partnerId : "me",
              text: newMessage.content,
              timestamp: newMessage.display_time,
            };

            return {
              ...conv,
              lastMessage: newMessage.content,
              time: newMessage.display_time,
              messages: [...conv.messages, incomingMessage],
            };
          }),
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !activeId || isSending) return;

    setIsSending(true);
    setInputText("");

    // Optimistic update: langsung tampilkan pesan sementara sebelum response API datang
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: "me",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId
          ? {
              ...conv,
              lastMessage: text,
              time: optimisticMessage.timestamp,
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

      // Response berformat array: [{ message, data }, { status }]
      const firstItem = Array.isArray(json)
        ? json.find((item) => item?.data !== undefined)
        : json;
      const sentMessage: SendMessageApiData | undefined = firstItem?.data;

      if (sentMessage) {
        // Ganti pesan optimis dengan data asli dari server (id, timestamp resmi)
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeId
              ? {
                  ...conv,
                  lastMessage: sentMessage.content,
                  time: sentMessage.display_time,
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

      // Rollback: hapus pesan optimis yang gagal terkirim
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

  return (
    <div className="fixed inset-x-0 bottom-0 top-20 z-10 flex bg-white lg:left-64">
      {/* Sidebar Kiri: Daftar Chat */}
      <div className="flex w-full shrink-0 flex-col border-r bg-slate-50/50 md:w-80 lg:w-96">
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

        {/* Loading State */}
        {loading && (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat percakapan...
          </div>
        )}

        {/* Error State */}
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

        {/* Empty State */}
        {!loading && !error && filteredConversations.length === 0 && (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-400">
            Belum ada percakapan.
          </div>
        )}

        {/* List Percakapan */}
        {!loading && !error && filteredConversations.length > 0 && (
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredConversations.map((item) => {
              const isActive = item.id === activeId;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
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
                      {item.unreadCount && (
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
        <div className="hidden min-w-0 flex-1 flex-col bg-white md:flex">
          {/* Header Chat */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
            <div className="flex items-center gap-3">
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

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

          {/* Chat Input */}
          <div className="shrink-0 border-t bg-white p-4">
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
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <Paperclip className="h-5 w-5" />
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
