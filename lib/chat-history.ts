import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  createdAt?: unknown;
};

export type ChatSummary = {
  id: string;
  title: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  preview?: string;
};

const chatsCollection = (uid: string) => collection(db, "users", uid, "chats");
const chatDoc = (uid: string, chatId: string) => doc(db, "users", uid, "chats", chatId);
const messagesCollection = (uid: string, chatId: string) =>
  collection(db, "users", uid, "chats", chatId, "messages");

export async function createChat(uid: string, title = "New chat") {
  const chatRef = await addDoc(chatsCollection(uid), {
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    preview: "",
  });
  return chatRef.id;
}

export async function updateChatPreview(uid: string, chatId: string, preview: string, title?: string) {
  await updateDoc(chatDoc(uid, chatId), {
    ...(title ? { title } : {}),
    preview: preview.slice(0, 120),
    updatedAt: serverTimestamp(),
  });
}

export async function saveMessage(uid: string, chatId: string, role: ChatMessage["role"], text: string) {
  const messageRef = await addDoc(messagesCollection(uid, chatId), {
    role,
    text,
    createdAt: serverTimestamp(),
  });

  await updateChatPreview(uid, chatId, text);
  return messageRef.id;
}

export async function loadChats(uid: string): Promise<ChatSummary[]> {
  const snapshot = await getDocs(query(chatsCollection(uid), orderBy("updatedAt", "desc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatSummary, "id">) }));
}

export async function loadMessages(uid: string, chatId: string): Promise<ChatMessage[]> {
  const snapshot = await getDocs(query(messagesCollection(uid, chatId), orderBy("createdAt", "asc")));
  return snapshot.docs.map((item) => ({
    id: item.id,
    role: item.data().role,
    text: item.data().text,
    createdAt: item.data().createdAt,
  }));
}

export async function migrateLegacyMessages(uid: string) {
  const legacy = await getDocs(
    query(collection(db, "users", uid, "messages"), orderBy("createdAt", "asc"))
  );
  if (legacy.empty) return null;

  const chatId = await createChat(uid, "Previous conversation");
  for (const item of legacy.docs) {
    const data = item.data();
    await addDoc(messagesCollection(uid, chatId), {
      role: data.role,
      text: data.text,
      createdAt: data.createdAt ?? serverTimestamp(),
    });
  }

  const last = legacy.docs[legacy.docs.length - 1]?.data();
  if (last?.text) await updateChatPreview(uid, chatId, last.text);
  return chatId;
}

export async function deleteChat(uid: string, chatId: string) {
  const messages = await getDocs(messagesCollection(uid, chatId));
  await Promise.all(messages.docs.map((item) => deleteDoc(item.ref)));
  await deleteDoc(chatDoc(uid, chatId));
}
