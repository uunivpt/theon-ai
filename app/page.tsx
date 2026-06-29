"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import TypingIndicator from "../components/TypingIndicator";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
type Message = {
  role: "user" | "ai";
  text: string;
};
type Chat = {
  id: number;
  title: string;
  messages: Message[];
};
export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
const [chats, setChats] = useState<Chat[]>([]);
const [currentChatId, setCurrentChatId] = useState<number>(1);
  const chatRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "messages"),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);

    const loadedMessages: Message[] = snapshot.docs.map((doc) => ({
      role: doc.data().role,
      text: doc.data().text,
    }));

    setMessages(loadedMessages);
  });

  return () => unsubscribe();
}, [router]);
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

   async function sendMessage() {
    if (!message.trim()) return;

    const userText = message;
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsTyping(true);
if (auth.currentUser) {
  await addDoc(
    collection(db, "users", auth.currentUser.uid, "messages"),
    {
      role: "user",
      text: userText,
      createdAt: serverTimestamp(),
    }
  );
}
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

     setIsTyping(false);

setMessages((prev) => [
  ...prev,
  { role: "ai", text: data.reply },
]);

if (auth.currentUser) {
  await addDoc(
    collection(db, "users", auth.currentUser.uid, "messages"),
    {
      role: "ai",
      text: data.reply,
      createdAt: serverTimestamp(),
    }
  );
}
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "❌ Error connecting to AI" },
      ]);
    }
  }
async function logout() {
  await signOut(auth);
  router.push("/login");
} function newChat() {
  const id = Date.now();

  setChats((prev) => [
    ...prev,
    {
      id,
      title: "New Chat",
      messages: [],
    },
  ]);

  setCurrentChatId(id);
  setMessages([]);
  setMessage("");
}
  return (
    <main className="flex h-screen bg-gradient-to-br from-black via-[#070707] to-[#111827]">
      <Sidebar
  onNewChat={newChat}
  chats={chats}
  onSelectChat={(id) => {
    setCurrentChatId(id);

    const chat = chats.find((c) => c.id === id);

    if (chat) {
      setMessages(chat.messages);
    }
  }}
/>

      <section className="flex-1 flex flex-col">
        <Header/>

        <div ref={chatRef} className="flex-1 overflow-y-auto px-8 py-8">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-xl">
              Ask me anything...
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ai" && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white">
                      ✨
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-3xl px-5 py-4 border shadow-xl ${
                      msg.role === "user"
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-white/10 border-white/10 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white">
                      👤
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white">
                    ✨
                  </div>

                  <div className="bg-white/10 border border-white/10 rounded-3xl px-5 py-4">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="border-t border-white/10 bg-[#090909] p-5">
          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 h-16 rounded-2xl bg-[#1f2937] text-white px-6 outline-none border border-gray-700"
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-7 rounded-2xl"
            >
              Send
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
