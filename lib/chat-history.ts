import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
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
  const chatRef = doc(chatsCollection(uid));
  await setDoc(chatRef, {
    title,
    preview: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return chatRef.id;
}

export async function updateChatPreview(
  uid: string,
  chatId: string,
  preview: string,
  title?: string,
) {
  await updateDoc(chatDoc(uid, chatId), {
    ...(title ? { title } : {}),
    preview: preview.slice(0, 160),
    updatedAt: serverTimestamp(),
  });
}

export async function renameChat(uid: string, chatId: string, title: string) {
  const cleanTitle = title.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!cleanTitle) return;
  await updateDoc(chatDoc(uid, chatId), {
    title: cleanTitle,
    updatedAt: serverTimestamp(),
  });
}

export async function saveMessage(
  uid: string,
  chatId: string,
  role: ChatMessage["role"],
  text: string,
) {
  const batch = writeBatch(db);
  const messageRef = doc(messagesCollection(uid, chatId));
  batch.set(messageRef, {
    role,
    text,
    createdAt: serverTimestamp(),
  });
  batch.update(chatDoc(uid, chatId), {
    preview: text.slice(0, 160),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return messageRef.id;
}

export async function loadChats(uid: string): Promise<ChatSummary[]> {
  const snapshot = await getDocs(query(chatsCollection(uid), orderBy("updatedAt", "desc")));
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<ChatSummary, "id">),
  }));
}

export async function loadMessages(uid: string, chatId: string): Promise<ChatMessage[]> {
  const snapshot = await getDocs(
    query(messagesCollection(uid, chatId), orderBy("createdAt", "asc")),
  );
  return snapshot.docs.map((item) => ({
    id: item.id,
    role: item.data().role as ChatMessage["role"],
    text: String(item.data().text ?? ""),
    createdAt: item.data().createdAt,
  }));
}

export async function migrateLegacyMessages(uid: string) {
  const legacyCollection = collection(db, "users", uid, "messages");
  const legacy = await getDocs(query(legacyCollection, orderBy("createdAt", "asc")));
  if (legacy.empty) return null;

  const chatId = await createChat(uid, "Previous conversation");
  const batch = writeBatch(db);
  let lastText = "";

  for (const item of legacy.docs) {
    const data = item.data();
    const messageRef = doc(messagesCollection(uid, chatId));
    batch.set(messageRef, {
      role: data.role === "user" ? "user" : "ai",
      text: String(data.text ?? ""),
      createdAt: data.createdAt ?? serverTimestamp(),
    });
    lastText = String(data.text ?? lastText);
  }

  batch.update(chatDoc(uid, chatId), {
    preview: lastText.slice(0, 160),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return chatId;
}

export async function deleteChat(uid: string, chatId: string) {
  const messages = await getDocs(messagesCollection(uid, chatId));
  const batch = writeBatch(db);
  messages.docs.forEach((item) => batch.delete(item.ref));
  batch.delete(chatDoc(uid, chatId));
  await batch.commit();
}
