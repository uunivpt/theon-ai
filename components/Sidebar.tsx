type SidebarProps = {
  onNewChat: () => void;
  chats: {
    id: number;
    title: string;
  }[];
  onSelectChat: (id: number) => void;
};

export default function Sidebar({
  onNewChat,
  chats,
  onSelectChat,
}: SidebarProps) {
  return (
    <aside className="w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 p-5 flex flex-col">

      <h1 className="text-2xl font-bold text-white mb-6">
        ✨ Theon AI
      </h1>

      <button
        onClick={onNewChat}
        className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white py-3 rounded-2xl"
      >
        + New Chat
      </button>

      <div className="mt-8 flex-1 overflow-y-auto">
  {chats.length === 0 ? (
    <p className="text-gray-400 text-sm">
      No chats yet
    </p>
  ) : (
    chats.map((chat) => (
      <button
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        className="w-full text-left bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 text-white mb-2 transition"
      >
        💬 {chat.title}
      </button>
    ))
  )}
</div>

    </aside>
  );
}