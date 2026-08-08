"use client";

import { useEffect, useRef, useState } from "react";
import MobileLayout from "@/components/mobile/MobileLayout";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileWelcome from "@/components/mobile/MobileWelcome";
import MobileInput from "@/components/mobile/MobileInput";
import MobileSidebar from "@/components/mobile/MobileSidebar";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatBubble from "../components/ChatBubble";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  createChat,
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
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean || "New chat";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        let loadedChats = await loadChats(user.uid);

        // Preserve the old flat message history created by the previous version.
        if (loadedChats.length === 0) {
          const migratedId = await migrateLegacyMessages(user.uid);
          if (migratedId) loadedChats = await loadChats(user.uid);
        }

        setChats(loadedChats);

        if (loadedChats.length > 0) {
          const firstChat = loadedChats[0];
          setCurrentChatId(firstChat.id);
          const loadedMessages = await loadMessages(user.uid, firstChat.id);
          setMessages(loadedMessages.map(({ role, text }) => ({ role, text })));
        } else {
          setMessages([]);
          setCurrentChatId(null);
        }
      } catch (error) {
        console.error("Failed to load chat history", error);
      } finally {
        setUserReady(true);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  async function startNewChat() {
    const user = auth.currentUser;
    if (!user) return;

    const id = await createChat(user.uid);
    const freshChat: ChatSummary = {
      id,
      title: "New chat",
      preview: "",
    };

    setChats((prev) => [freshChat, ...prev]);
    setCurrentChatId(id);
    setMessages([]);
    setMessage("");
    setMobileSidebarOpen(false);
  }

  async function selectChat(id: string) {
    const user = auth.currentUser;
    if (!user) return;

    setMobileSidebarOpen(false);
    setCurrentChatId(id);

    try {
      const loadedMessages = await loadMessages(user.uid, id);
      setMessages(loadedMessages.map(({ role, text }) => ({ role, text })));
    } catch (error) {
      console.error("Failed to load chat", error);
    }
  }

  async function sendMessage() {
    if (!message.trim() || isTyping || !userReady) return;

    const user = auth.currentUser;
    if (!user) return;

    const userText = message.trim();
    setMessage("");

    let chatId = currentChatId;
    const isFirstMessage = !chatId || messages.length === 0;

    try {
      if (!chatId) {
        chatId = await createChat(user.uid, makeTitle(userText));
        setCurrentChatId(chatId);
        setChats((prev) => [
          { id: chatId!, title: makeTitle(userText), preview: userText },
          ...prev,
        ]);
      } else if (isFirstMessage) {
        await updateChatPreview(user.uid, chatId, userText, makeTitle(userText));
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, title: makeTitle(userText), preview: userText }
              : chat
          )
        );
      }

      // Persist the user's message immediately. Closing/backing out cannot erase it.
      await saveMessage(user.uid, chatId, "user", userText);
      setMessages((prev) => [...prev, { role: "user", text: userText }]);
      setIsTyping(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error || "AI request failed");

      const fullText = String(data.reply);
      let current = "";
      setMessages((prev) => [...prev, { role: "ai", text: "" }]);

      for (let i = 0; i < fullText.length; i++) {
        current += fullText[i];
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", text: current };
          return updated;
        });
        await new Promise((resolve) => setTimeout(resolve, 8));
      }

      await saveMessage(user.uid, chatId, "ai", fullText);
      setChats((prev) =>
        prev
          .map((chat) => (chat.id === chatId ? { ...chat, preview: fullText } : chat))
          .sort((a, b) => (a.id === chatId ? -1 : b.id === chatId ? 1 : 0))
      );
    } catch (error) {
      console.error("Chat error", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "❌ Failed to connect with Theon AI." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  async function logout() {
    await signOut(auth);
    router.push("/login");
  }

  const isHomeScreen = messages.length === 0;

  return (
    <>
      <MobileLayout>
        <MobileHeader onMenu={() => setMobileSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          {isHomeScreen ? (
            <MobileWelcome />
          ) : (
            <div ref={chatRef} className="flex flex-col gap-5 px-5 pt-6 pb-40">
              {messages.map((msg, index) => (
                <ChatBubble key={`${msg.role}-${index}`} role={msg.role} text={msg.text} />
              ))}
              {isTyping && (
                <div className="flex items-end gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white">✨</div>
                  <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl">
                    <div className="flex gap-2"><span className="h-2 w-2 animate-bounce rounded-full bg-white" /><span className="h-2 w-2 animate-bounce rounded-full bg-white" /><span className="h-2 w-2 animate-bounce rounded-full bg-white" /></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <MobileInput value={message} onChange={setMessage} onSend={sendMessage} />
        <MobileSidebar
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={startNewChat}
          onSelectChat={selectChat}
          onLogout={logout}
        />
      </MobileLayout>

      <main className="hidden md:flex h-screen bg-gradient-to-br from-black via-[#070707] to-[#111827]">
        <Sidebar
          onNewChat={startNewChat}
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={selectChat}
        />
        <section className="flex-1 flex flex-col">
          <Header />
          <div ref={chatRef} className="flex-1 overflow-y-auto px-8 py-8">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xl text-gray-500">Ask me anything...</div>
            ) : (
              <div className="mx-auto w-full max-w-3xl space-y-6">
                {messages.map((msg, index) => (
                  <ChatBubble key={`${msg.role}-${index}`} role={msg.role} text={msg.text} />
                ))}
                {isTyping && <div className="text-sm text-white/40">Theon is thinking…</div>}
              </div>
            )}
          </div>
          <footer className="border-t border-white/10 bg-[#090909] p-5">
            <div className="mx-auto flex max-w-3xl gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                disabled={!userReady || isTyping}
                className="h-16 flex-1 rounded-2xl border border-gray-700 bg-[#1f2937] px-6 text-white outline-none disabled:opacity-50"
              />
              <button onClick={sendMessage} disabled={!userReady || isTyping} className="rounded-2xl bg-blue-600 px-7 text-white hover:bg-blue-700 disabled:opacity-50">Send</button>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}
