"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/mobile/MobileLayout";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileWelcome from "@/components/mobile/MobileWelcome";
import MobileInput from "@/components/mobile/MobileInput";
import MobileSidebar from "@/components/mobile/MobileSidebar";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ChatBubble from "@/components/ChatBubble";
import { auth } from "@/lib/firebase";
import {
  createChat,
  deleteChat,
  loadChats,
  loadMessages,
  migrateLegacyMessages,
  saveMessage,
  updateChatPreview,
  type ChatMessage,
  type ChatSummary,
} from "@/lib/chat-history";

type Message = Pick<ChatMessage, "role" | "text">;

function makeTitle(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? `${clean.slice(0, 48)}…` : clean || "New chat";
}

function sortChats(chats: ChatSummary[]) {
  return [...chats].sort((a, b) => {
    const aTime = a.updatedAt && typeof a.updatedAt === "object" && "toMillis" in a.updatedAt
      ? (a.updatedAt as { toMillis: () => number }).toMillis()
      : 0;
    const bTime = b.updatedAt && typeof b.updatedAt === "object" && "toMillis" in b.updatedAt
      ? (b.updatedAt as { toMillis: () => number }).toMillis()
      : 0;
    return bTime - aTime;
  });
}

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [userReady, setUserReady] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        let loadedChats = await loadChats(user.uid);

        if (loadedChats.length === 0) {
          const migratedId = await migrateLegacyMessages(user.uid);
          if (migratedId) loadedChats = await loadChats(user.uid);
        }

        if (!active) return;
        setChats(sortChats(loadedChats));

        if (loadedChats.length > 0) {
          const firstChat = loadedChats[0];
          setCurrentChatId(firstChat.id);
          const loadedMessages = await loadMessages(user.uid, firstChat.id);
          if (!active) return;
          setMessages(loadedMessages.map(({ role, text }) => ({ role, text })));
        } else {
          setMessages([]);
          setCurrentChatId(null);
        }
      } catch (error) {
        console.error("Failed to load chat history", error);
      } finally {
        if (active) setUserReady(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [router]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  async function startNewChat() {
    const user = auth.currentUser;
    if (!user || isTyping) return;

    try {
      const id = await createChat(user.uid);
      setChats((prev) => [{ id, title: "New chat", preview: "" }, ...prev]);
      setCurrentChatId(id);
      setMessages([]);
      setMessage("");
      setMobileSidebarOpen(false);
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  }

  async function selectChat(id: string) {
    const user = auth.currentUser;
    if (!user || isTyping) return;

    setMobileSidebarOpen(false);
    try {
      const loadedMessages = await loadMessages(user.uid, id);
      setCurrentChatId(id);
      setMessages(loadedMessages.map(({ role, text }) => ({ role, text })));
    } catch (error) {
      console.error("Failed to load chat", error);
    }
  }

  async function removeChat(id: string) {
    const user = auth.currentUser;
    if (!user || isTyping) return;

    try {
      await deleteChat(user.uid, id);
      const remaining = chats.filter((chat) => chat.id !== id);
      setChats(remaining);

      if (currentChatId === id) {
        const next = remaining[0];
        if (next) {
          setCurrentChatId(next.id);
          const loaded = await loadMessages(user.uid, next.id);
          setMessages(loaded.map(({ role, text }) => ({ role, text })));
        } else {
          setCurrentChatId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  }

  function animateResponse(fullText: string) {
    const startedAt = performance.now();
    const charsPerSecond = 48;

    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    const frame = (now: number) => {
      const elapsed = now - startedAt;
      const visibleCharacters = Math.min(
        fullText.length,
        Math.floor((elapsed / 1000) * charsPerSecond),
      );

      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        next[next.length - 1] = { role: "ai", text: fullText.slice(0, visibleCharacters) };
        return next;
      });

      if (visibleCharacters < fullText.length) {
        animationFrameRef.current = requestAnimationFrame(frame);
      } else {
        animationFrameRef.current = null;
        setIsTyping(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(frame);
  }

  async function sendMessage() {
    const user = auth.currentUser;
    const userText = message.trim();
    if (!user || !userText || isTyping || !userReady) return;

    setMessage("");
    const previousMessages = messages;
    let chatId = currentChatId;
    const firstMessage = !chatId || previousMessages.length === 0;

    try {
      if (!chatId) {
        chatId = await createChat(user.uid, makeTitle(userText));
        setCurrentChatId(chatId);
        setChats((prev) => [
          { id: chatId!, title: makeTitle(userText), preview: userText },
          ...prev,
        ]);
      } else if (firstMessage) {
        await updateChatPreview(user.uid, chatId, userText, makeTitle(userText));
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, title: makeTitle(userText), preview: userText }
              : chat,
          ),
        );
      }

      await saveMessage(user.uid, chatId, "user", userText);
      setMessages((prev) => [...prev, { role: "user", text: userText }]);
      setIsTyping(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: previousMessages,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.reply !== "string") {
        throw new Error(data.error || "AI request failed");
      }

      const fullText = data.reply.trim();
      // Persist the complete response before the visual typing animation starts.
      // Leaving/backing out during animation therefore cannot lose the answer.
      await saveMessage(user.uid, chatId, "ai", fullText);

      setChats((prev) => [
        { ...(prev.find((chat) => chat.id === chatId) ?? { id: chatId, title: makeTitle(userText) }), preview: fullText },
        ...prev.filter((chat) => chat.id !== chatId),
      ]);

      animateResponse(fullText);
    } catch (error) {
      console.error("Chat error", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "I couldn't complete that request. Please try again." },
      ]);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  const isHomeScreen = messages.length === 0;

  return (
    <>
      <MobileLayout>
        <MobileHeader onMenu={() => setMobileSidebarOpen(true)} />
        <div ref={chatRef} className="flex-1 overflow-y-auto overscroll-contain">
          {isHomeScreen ? (
            <MobileWelcome />
          ) : (
            <div className="flex flex-col gap-5 px-4 pt-6 pb-36 sm:px-5">
              {messages.map((msg, index) => (
                <ChatBubble key={`${msg.role}-${index}`} role={msg.role} text={msg.text} />
              ))}
              {isTyping && messages[messages.length - 1]?.text === "" && (
                <div className="flex items-end gap-3 px-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.045]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <MobileInput value={message} onChange={setMessage} onSend={sendMessage} disabled={!userReady || isTyping} />
        <MobileSidebar
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={startNewChat}
          onSelectChat={selectChat}
          onDeleteChat={removeChat}
          onLogout={logout}
        />
      </MobileLayout>

      <main className="hidden h-screen bg-gradient-to-br from-black via-[#070707] to-[#111827] md:flex">
        <Sidebar
          onNewChat={startNewChat}
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={selectChat}
          onDeleteChat={removeChat}
        />
        <section className="flex min-w-0 flex-1 flex-col">
          <Header />
          <div ref={chatRef} className="flex-1 overflow-y-auto overscroll-contain px-8 py-8">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xl text-white/35">Ask me anything...</div>
            ) : (
              <div className="mx-auto w-full max-w-3xl space-y-6">
                {messages.map((msg, index) => (
                  <ChatBubble key={`${msg.role}-${index}`} role={msg.role} text={msg.text} />
                ))}
              </div>
            )}
          </div>
          <footer className="border-t border-white/10 bg-[#090909] p-5">
            <div className="mx-auto flex max-w-3xl gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type your message..."
                disabled={!userReady || isTyping}
                className="h-16 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-white outline-none placeholder:text-white/25 focus:border-violet-400/40 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!userReady || isTyping || !message.trim()}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-7 font-medium text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}
