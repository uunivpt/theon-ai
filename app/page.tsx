"use client";

import { useEffect, useRef, useState } from "react";

import MobileLayout from "@/components/mobile/MobileLayout";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileWelcome from "@/components/mobile/MobileWelcome";
import MobileInput from "@/components/mobile/MobileInput";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import MobileSidebar from "@/components/mobile/MobileSidebar";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatBubble from "../components/ChatBubble";

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

  // ---------------- STATES ----------------

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] =
    useState<number>(1);

  const chatRef = useRef<HTMLDivElement>(null);

  // ---------------- AUTH ----------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.push("/login");
          return;
        }

        const q = query(
          collection(
            db,
            "users",
            user.uid,
            "messages"
          ),
          orderBy("createdAt", "asc")
        );

        const snapshot = await getDocs(q);

        const loadedMessages: Message[] =
          snapshot.docs.map((doc) => ({
            role: doc.data().role,
            text: doc.data().text,
          }));

        setMessages(loadedMessages);
      }
    );

    return () => unsubscribe();
  }, [router]);

  // ---------------- KEYBOARD ----------------

  useEffect(() => {
    const handleResize = () => {
      setKeyboardOpen(
        window.innerHeight <
          window.screen.height * 0.75
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  // ---------------- AUTO SCROLL ----------------

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);
    // ---------------- SEND MESSAGE ----------------

  async function sendMessage() {
  if (!message.trim()) return;

  const userText = message.trim();

  setMessage("");

  // Show user message
  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      text: userText,
    },
  ]);

  setIsTyping(true);

  try {
    // Save user message
    if (auth.currentUser) {
      await addDoc(
        collection(
          db,
          "users",
          auth.currentUser.uid,
          "messages"
        ),
        {
          role: "user",
          text: userText,
          createdAt: serverTimestamp(),
        }
      );
    }

    // AI Request
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userText,
      }),
    });

    const data = await res.json();

    // Empty AI bubble
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "",
      },
    ]);

    const fullText = data.reply;
    let current = "";

    for (let i = 0; i < fullText.length; i++) {
      current += fullText[i];

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "ai",
          text: current,
        };

        return updated;
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 8)
      );
    }

    // Save final AI reply
    if (auth.currentUser) {
      await addDoc(
        collection(
          db,
          "users",
          auth.currentUser.uid,
          "messages"
        ),
        {
          role: "ai",
          text: fullText,
          createdAt: serverTimestamp(),
        }
      );
    }
  } catch (error) {
    console.error(error);

  

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "❌ Failed to connect with Theon AI.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  // ---------------- LOGOUT ----------------

  async function logout() {
    await signOut(auth);
    router.push("/login");
  }

  // ---------------- NEW CHAT ----------------
    function newChat() {
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

  // ---------------- MOBILE ----------------

  const isHomeScreen = messages.length === 0;

  return (
    <>
    <MobileLayout>

  <MobileHeader
    onMenu={() => setMobileSidebarOpen(true)}
  />
<div className="flex-1 overflow-y-auto">

  {isHomeScreen ? (

    <MobileWelcome />

  ) : (

    <div
      ref={chatRef}
      className="flex flex-col gap-5 px-5 pt-6 pb-40 animate-in fade-in duration-500"
    >

      {messages.map((msg, index) => (
        <ChatBubble
          key={index}
          role={msg.role}
          text={msg.text}
        />
      ))}

      {isTyping && (
        <div className="flex items-end gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white">
            ✨
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl">
            <div className="flex gap-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-white"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-white"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-white"></span>
            </div>
          </div>

        </div>
      )}

    </div>

  )}

</div>
      
        

        {isTyping && (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white">
      ✨
    </div>

    <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-white">
      Thinking...
    </div>
  </div>
)}

    <MobileInput
    value={message}
    onChange={setMessage}
    onSend={sendMessage}
  />

  <MobileSidebar
    open={mobileSidebarOpen}
    onClose={() => setMobileSidebarOpen(false)}
  />

</MobileLayout>

<main className="hidden md:flex h-screen bg-gradient-to-br from-black via-[#070707] to-[#111827]">

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

    <Header />

    <div
      ref={chatRef}
      className="flex-1 overflow-y-auto px-8 py-8"
    >
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-xl text-gray-500">
          Ask me anything...
        </div>
      ) : (
        <div className="space-y-6">

          {messages.map((msg, index) => (
            <ChatBubble
              key={index}
              role={msg.role}
              text={msg.text}
            />
          ))}

          {isTyping && (
            <div className="flex items-end gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white">
                ✨
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
                <div className="flex gap-2">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
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
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
          placeholder="Type your message..."
          className="h-16 flex-1 rounded-2xl border border-gray-700 bg-[#1f2937] px-6 text-white outline-none"
        />

        <button
          onClick={sendMessage}
          className="rounded-2xl bg-blue-600 px-7 text-white hover:bg-blue-700"
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