"use client";

import { useState } from "react";
import { Search, Info, Smile, Paperclip, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  status: "Online" | "Offline";
  lastMessage: string;
  time: string;
  unreadCount?: number;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Andi Pratama",
    avatar: "/profile.jpg",
    status: "Online",
    lastMessage: "Oke, sampai jumpa besok!",
    time: "10:42 AM",
    unreadCount: 2,
    messages: [
      {
        id: "m1",
        senderId: "1",
        text: "Hai Fadhlan! 👋\nKapan kita mulai belajar React?",
        timestamp: "10:40 AM",
      },
      {
        id: "m2",
        senderId: "me",
        text: "Hai Andi! Besok malam bagaimana? Saya setelah jam 7 malam.",
        timestamp: "10:41 AM",
        isRead: true,
      },
      {
        id: "m3",
        senderId: "1",
        text: "Oke, sampai jumpa besok!",
        timestamp: "10:42 AM",
      },
    ],
  },
  {
    id: "2",
    name: "Sinta Aulia",
    avatar: "/profile.jpg",
    status: "Offline",
    lastMessage: "Terima kasih banyak 🙏",
    time: "Yesterday",
    messages: [],
  },
  {
    id: "3",
    name: "Budi Hermawan",
    avatar: "/profile.jpg",
    status: "Offline",
    lastMessage: "Baik, saya coba dulu ya",
    time: "Yesterday",
    messages: [],
  },
  {
    id: "4",
    name: "Nadia Putri",
    avatar: "/profile.jpg",
    status: "Offline",
    lastMessage: "File yang kamu kirim sangat membantu!",
    time: "2 days ago",
    messages: [],
  },
  {
    id: "5",
    name: "Rizky Kurniawan",
    avatar: "/profile.jpg",
    status: "Offline",
    lastMessage: "Kapan kita lanjut lagi?",
    time: "3 days ago",
    messages: [],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(
    INITIAL_CONVERSATIONS,
  );
  const [activeId, setActiveId] = useState<string>("1");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConversation = conversations.find((c) => c.id === activeId);

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: false,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeId) {
          return {
            ...conv,
            lastMessage: inputText,
            time: newMessage.timestamp,
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      }),
    );

    setInputText("");
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

        {/* List Percakapan */}
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
            {activeConversation.messages.map((msg) => {
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
                  className="h-9 w-9 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center text-slate-400 md:flex">
          Pilih percakapan untuk memulai percakapan.
        </div>
      )}
    </div>
  );
}
