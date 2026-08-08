"use client";

import { useRef, useState } from "react";
import { ArrowUp, FileText, ImagePlus, Plus, X } from "lucide-react";

export type SelectedFeature = {
  id: string;
  label: string;
  hint: string;
};

export type Attachment = {
  name: string;
  type: string;
  dataUrl: string;
};

type Props = {
  feature: SelectedFeature | null;
  value: string;
  onChange: (value: string) => void;
  onSend: (attachments: Attachment[]) => void;
  onClearFeature: () => void;
  disabled?: boolean;
};

export default function FeatureInput({ feature, value, onChange, onSend, onClearFeature, disabled = false }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const accepted = Array.from(files).filter((file) => file.type.startsWith("image/") || file.type === "application/pdf").slice(0, 4);
    const next = await Promise.all(accepted.map((file) => new Promise<Attachment>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: String(reader.result) });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })));
    setAttachments((current) => [...current, ...next].slice(0, 4));
  }

  const canSend = !disabled && (value.trim().length > 0 || attachments.length > 0);

  return (
    <div className="fixed bottom-[max(10px,env(safe-area-inset-bottom))] left-3 right-3 z-30 md:hidden">
      {feature && (
        <div className="mb-2 flex items-center gap-2 rounded-2xl border border-violet-400/20 bg-[#0b0b0b]/95 px-3 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,.5)] backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-white/90">{feature.label}</p>
            <p className="truncate text-[10px] text-white/35">{feature.hint}</p>
          </div>
          <button type="button" onClick={onClearFeature} aria-label="Change feature" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white active:scale-95"><X size={15} /></button>
        </div>
      )}
      {attachments.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#090909]/95 p-2 backdrop-blur-xl">
          {attachments.map((file, index) => (
            <button key={`${file.name}-${index}`} type="button" onClick={() => setAttachments((items) => items.filter((_, i) => i !== index))} className="relative flex h-11 max-w-[150px] shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] px-2 text-left text-[10px] text-white/60">
              {file.type.startsWith("image/") ? <ImagePlus size={15} /> : <FileText size={15} />}
              <span className="truncate">{file.name}</span><X size={12} className="ml-1 text-white/35" />
            </button>
          ))}
        </div>
      )}
      <div className="relative flex min-h-[60px] items-center gap-2 rounded-[28px] border border-white/[0.12] bg-black px-1.5 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,.65)]">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={disabled} aria-label="Attach image or PDF" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-white/75 transition active:scale-95 disabled:opacity-40"><Plus size={22} strokeWidth={1.7} /></button>
        <input ref={fileRef} type="file" accept="image/*,.pdf,application/pdf" multiple className="hidden" onChange={(event) => { void addFiles(event.target.files); event.currentTarget.value = ""; }} />
        <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (canSend) onSend(attachments); } }} placeholder={feature ? "Add context for Theon..." : "Ask Theon anything..."} disabled={disabled} className="h-11 min-w-0 flex-1 bg-transparent px-1 text-[15px] text-white outline-none placeholder:text-white/30 disabled:opacity-50" />
        <button onClick={() => onSend(attachments)} disabled={!canSend} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-500 to-cyan-400 text-black shadow-[0_0_22px_rgba(124,58,237,.28)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"><ArrowUp size={21} strokeWidth={2.4} /></button>
      </div>
    </div>
  );
}
