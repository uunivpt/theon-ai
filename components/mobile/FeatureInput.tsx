"use client";

import { useRef, useState } from "react";
import { FileText, ImagePlus, Plus, X, ArrowUp } from "lucide-react";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { auth } from "@/lib/firebase";

export type SelectedFeature = {
  id: string;
  label: string;
  hint: string;
};

export type Attachment = {
  name: string;
  type: string;
  dataUrl: string;
  storageUrl?: string;
};

type Props = {
  feature: SelectedFeature | null;
  value: string;
  onChange: (value: string) => void;
  onSend: (attachments: Attachment[]) => void;
  onClearFeature: () => void;
  disabled?: boolean;
};

const MAX_IMAGE_DATA_URL_LENGTH = 3_000_000;
const MAX_IMAGE_DIMENSION = 1600;
const MAX_PDF_SIZE = 6 * 1024 * 1024;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File): Promise<Attachment> {
  if (file.type === "image/heic" || file.type === "image/heif") {
    return { name: file.name, type: file.type, dataUrl: await readAsDataUrl(file) };
  }

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = sourceUrl;
    await image.decode();

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable on this device");
    context.drawImage(image, 0, 0, width, height);

    let quality = 0.82;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH && quality > 0.5) {
      quality -= 0.08;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    return { name: file.name, type: "image/jpeg", dataUrl };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function uploadPdf(file: File): Promise<Attachment> {
  if (file.size > MAX_PDF_SIZE) {
    throw new Error("PDF is too large. Please upload a PDF smaller than 6 MB.");
  }
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in before uploading a PDF.");

  const storage = getStorage();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `pdfs/${user.uid}/${crypto.randomUUID()}-${safeName}`;
  const objectRef = storageRef(storage, path);
  await uploadBytes(objectRef, file, { contentType: "application/pdf" });
  const storageUrl = await getDownloadURL(objectRef);

  return { name: file.name, type: "application/pdf", dataUrl: "", storageUrl };
}

export default function FeatureInput({ feature, value, onChange, onSend, onClearFeature, disabled = false }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function addFiles(files: FileList | null) {
    if (!files) return;
    setError("");
    const accepted = Array.from(files)
      .filter((file) => file.type.startsWith("image/") || file.type === "application/pdf")
      .slice(0, 4);

    if (accepted.length === 0) {
      setError("Please select an image or PDF.");
      return;
    }

    setProcessing(true);
    try {
      const next = await Promise.all(accepted.map(async (file) => {
        if (file.type === "application/pdf") return uploadPdf(file);
        return compressImage(file);
      }));
      setAttachments((current) => [...current, ...next].slice(0, 4));
    } catch (processingError) {
      console.error("Attachment processing failed", processingError);
      setError(processingError instanceof Error ? processingError.message : "Could not process the attachment.");
    } finally {
      setProcessing(false);
    }
  }

  function sendAttachments() {
    if (!canSend || processing) return;
    const pending = attachments;
    setAttachments([]);
    onSend(pending);
  }

  const canSend = !disabled && !processing && (value.trim().length > 0 || attachments.length > 0);

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
      {error && <div className="mb-2 rounded-2xl border border-red-400/20 bg-red-500/[.06] px-3 py-2 text-[11px] text-red-200">{error}</div>}
      {attachments.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#090909]/95 p-2 backdrop-blur-xl">
          {attachments.map((file, index) => (
            <button key={`${file.name}-${index}`} type="button" onClick={() => setAttachments((items) => items.filter((_, i) => i !== index))} className="relative flex h-11 max-w-[170px] shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] px-2 text-left text-[10px] text-white/60">
              {file.type.startsWith("image/") ? <ImagePlus size={15} /> : <FileText size={15} />}
              <span className="truncate">{file.name}</span><X size={12} className="ml-1 text-white/35" />
            </button>
          ))}
        </div>
      )}
      <div className="relative flex min-h-[60px] items-center gap-2 rounded-[28px] border border-white/[0.12] bg-black px-1.5 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,.65)]">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={disabled || processing} aria-label="Attach image or PDF" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-white/75 transition active:scale-95 disabled:opacity-40"><Plus size={22} strokeWidth={1.7} /></button>
        <input ref={fileRef} type="file" accept="image/*,.pdf,application/pdf" multiple className="hidden" onChange={(event) => { void addFiles(event.target.files); event.currentTarget.value = ""; }} />
        <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAttachments(); } }} placeholder={processing ? "Processing PDF..." : feature ? "Add context for Theon..." : "Ask Theon anything..."} disabled={disabled || processing} className="h-11 min-w-0 flex-1 bg-transparent px-1 text-[15px] text-white outline-none placeholder:text-white/30 disabled:opacity-50" />
        <button onClick={sendAttachments} disabled={!canSend} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-500 to-cyan-400 text-black shadow-[0_0_22px_rgba(124,58,237,.28)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"><ArrowUp size={21} strokeWidth={2.4} /></button>
      </div>
    </div>
  );
}
