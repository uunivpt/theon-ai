"use client";

import { useRef, useState } from "react";
import { ArrowUp, Camera, FileText, ImagePlus, Plus, X, Search, BookOpen, Code2, Eye, PenLine, Sparkles, ChevronDown } from "lucide-react";
import { processAttachmentFiles, type Attachment, type SelectedFeature } from "@/components/mobile/FeatureInput";
import { THEON_MODES, type TheonMode } from "@/lib/theon-modes";

type Props = {
  feature: SelectedFeature | null;
  value: string;
  onChange: (value: string) => void;
  onSend: (attachments: Attachment[]) => void;
  onClearFeature: () => void;
  mode: TheonMode;
  onModeChange: (mode: TheonMode) => void;
  enterToSend?: boolean;
  disabled?: boolean;
};

const icons = { chat: Sparkles, web: Search, research: Search, study: BookOpen, code: Code2, vision: Eye, write: PenLine };

export default function DesktopComposer({ feature, value, onChange, onSend, onClearFeature, mode, onModeChange, enterToSend = true, disabled = false }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [picker, setPicker] = useState(false);
  const [modePicker, setModePicker] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function choose(files: FileList | null) {
    if (!files) return;
    setPicker(false);
    setError("");
    setProcessing(true);
    try {
      const next = await processAttachmentFiles(Array.from(files).slice(0, 4));
      setAttachments((old) => [...old, ...next].slice(0, 4));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not process attachment.");
    } finally {
      setProcessing(false);
    }
  }

  const canSend = !disabled && !processing && (!!value.trim() || attachments.length > 0);
  const ModeIcon = icons[mode];
  const currentMode = THEON_MODES.find((item) => item.id === mode);

  function send() {
    if (!canSend) return;
    const files = attachments;
    setAttachments([]);
    onSend(files);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      if (enterToSend) {
        event.preventDefault();
        send();
      } else if (!event.ctrlKey && !event.metaKey) {
        return;
      }
    }
    if ((event.ctrlKey || event.metaKey) && (event.key === "Enter" || event.key === "NumpadEnter")) {
      event.preventDefault();
      send();
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="mb-2 flex min-w-0 items-center gap-2 overflow-hidden">
        {feature && (
          <div className="theon-control flex min-w-0 max-w-[280px] shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs">
            <span className="truncate font-medium">{feature.label}</span>
            <button type="button" onClick={onClearFeature} aria-label="Clear feature" className="shrink-0 rounded-full p-0.5 opacity-55 hover:opacity-100"><X size={13}/></button>
          </div>
        )}
        {attachments.length > 0 && (
          <div className="flex min-w-0 gap-2 overflow-x-auto py-0.5">
            {attachments.map((file, i) => (
              <button type="button" key={`${file.name}-${i}`} onClick={() => setAttachments((old) => old.filter((_, n) => n !== i))} className="theon-control flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-[10px] opacity-80 hover:opacity-100">
                <span>{file.type === "application/pdf" ? "PDF" : "Image"}</span><X size={11}/>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mb-2 rounded-xl border border-red-400/15 bg-red-400/[.05] px-3 py-2 text-xs text-red-300" role="alert">{error}</p>}

      {modePicker && (
        <div className="theon-glass absolute bottom-[76px] left-0 right-0 z-40 overflow-hidden rounded-2xl p-2 shadow-2xl">
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {THEON_MODES.map((item) => {
              const Icon = icons[item.id];
              const active = mode === item.id;
              return (
                <button type="button" key={item.id} onClick={() => { onModeChange(item.id); setModePicker(false); }} className={`flex min-w-[150px] shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left ${active ? "bg-violet-500/12 text-violet-100" : "text-zinc-400 hover:bg-white/[.04]"}`}>
                  <Icon size={16}/><span className="min-w-0"><span className="block truncate text-xs font-medium">{item.label}</span><span className="block truncate text-[9px] opacity-55">{item.description}</span></span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {picker && (
        <div className="theon-glass absolute bottom-[68px] left-0 z-40 flex gap-1.5 rounded-2xl p-2 shadow-2xl">
          <button type="button" onClick={() => cameraRef.current?.click()} className="flex w-20 flex-col items-center gap-1.5 rounded-xl p-3 text-[10px] text-zinc-400 hover:bg-white/[.05] hover:text-white"><Camera size={18}/>Camera</button>
          <button type="button" onClick={() => galleryRef.current?.click()} className="flex w-20 flex-col items-center gap-1.5 rounded-xl p-3 text-[10px] text-zinc-400 hover:bg-white/[.05] hover:text-white"><ImagePlus size={18}/>Gallery</button>
          <button type="button" onClick={() => pdfRef.current?.click()} className="flex w-20 flex-col items-center gap-1.5 rounded-xl p-3 text-[10px] text-zinc-400 hover:bg-white/[.05] hover:text-white"><FileText size={18}/>PDF</button>
        </div>
      )}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { void choose(e.target.files); e.currentTarget.value = ""; }}/>
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void choose(e.target.files); e.currentTarget.value = ""; }}/>
      <input ref={pdfRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { void choose(e.target.files); e.currentTarget.value = ""; }}/>

      <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
        <button type="button" onClick={() => { setModePicker((v) => !v); setPicker(false); }} aria-expanded={modePicker} className="theon-control flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium opacity-80 hover:opacity-100">
          <ModeIcon size={12}/>{currentMode?.label || "Chat"}<ChevronDown size={11} className={`transition-transform ${modePicker ? "rotate-180" : ""}`}/>
        </button>
        <span className="truncate text-[9px] text-zinc-500">{mode === "research" ? "Synthesize multiple sources" : mode === "web" ? "Use current web sources" : mode === "study" ? "Learn with structure and practice" : "Theon AI"}</span>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); send(); }} noValidate autoComplete="off" className="theon-glass flex min-w-0 items-center gap-2 rounded-[24px] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.20)]">
        <button type="button" onClick={() => { setPicker((v) => !v); setModePicker(false); }} disabled={disabled || processing} aria-label="Add attachment" className="theon-control flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] opacity-75 hover:opacity-100 disabled:opacity-35"><Plus size={20}/></button>
        <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder={processing ? "Reading PDF..." : feature ? `Add context for ${feature.label}...` : mode === "web" ? "Search the web with Theon..." : mode === "research" ? "Ask for deep research..." : "Ask Theon anything..."} disabled={disabled || processing} aria-label="Message Theon AI" className="h-12 min-w-0 flex-1 bg-transparent px-2 text-[15px] text-[var(--foreground)] placeholder:text-zinc-500"/>
        <button type="submit" disabled={!canSend} aria-label="Send message" className="theon-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] disabled:cursor-not-allowed disabled:opacity-30"><ArrowUp size={20}/></button>
      </form>
      <p className="mt-2 text-center text-[9px] text-zinc-500/80">{enterToSend ? "Enter to send · Shift+Enter for a new line" : "Ctrl/Cmd+Enter to send"}</p>
      {attachments.some((f) => f.type === "application/pdf") && <p className="mt-1 text-center text-[9px] text-zinc-500">PDF text is used for this analysis and is not saved as an attachment.</p>}
    </div>
  );
}
