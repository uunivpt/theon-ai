export type TheonMode = "chat" | "web" | "research" | "study" | "code" | "vision" | "write";

export const THEON_MODES: { id: TheonMode; label: string; description: string }[] = [
  { id: "chat", label: "Chat", description: "Natural conversation and everyday help" },
  { id: "web", label: "Web Search", description: "Search current worldwide web content with sources" },
  { id: "research", label: "Deep Research", description: "Gather and synthesize multiple sources" },
  { id: "study", label: "Study", description: "Learn deeply, but explain it simply" },
  { id: "code", label: "Code", description: "Explain, debug, improve, and design code" },
  { id: "vision", label: "Vision", description: "Understand images, screenshots, and diagrams" },
  { id: "write", label: "Write", description: "Draft, rewrite, summarize, and structure" },
];
