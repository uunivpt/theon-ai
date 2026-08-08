"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FileText, ImagePlus, Plus, X, ArrowUp } from "lucide-react";

export type SelectedFeature = { id: string; label: string; hint: string };
export type Attachment = { name: string; type: string; dataUrl: string; extractedText?: string };
type Props = { feature: SelectedFeature | null; value: string; onChange: (value: string) => void; onSend: (attachments: Attachment[]) => void; onClearFeature: () => void; disabled?: boolean };
const MAX_IMAGE_DATA_URL_LENGTH = 3_000_000;
const MAX_IMAGE_DIMENSION = 1600;
const MAX_PDF_SIZE = 6 * 1024 * 1024;
const MAX_PDF_TEXT = 120_000;

async function compressImage(file: File): Promise<Attachment> {
  if (file.type === "image/heic" || file.type === "image/heif") throw new Error("This camera format isn't supported. Please use JPG or PNG.");
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = new Image(); image.decoding = "async"; image.src = sourceUrl; await image.decode();
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d"); if (!context) throw new Error("Image processing is unavailable on this device"); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let quality = 0.82; let dataUrl = canvas.toDataURL("image/jpeg", quality); while (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH && quality > 0.5) { quality -= 0.08; dataUrl = canvas.toDataURL("image/jpeg", quality); }
    return { name: file.name, type: "image/jpeg", dataUrl };
  } finally { URL.revokeObjectURL(sourceUrl); }
}

async function extractPdfText(file: File): Promise<Attachment> {
  if (file.size > MAX_PDF_SIZE) throw new Error("PDF is too large. Please upload a PDF smaller than 6 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer()); const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdfVersion = String(pdfjs.version || "5.4.54"); pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.min.mjs`;
  const pdf = await pdfjs.getDocument({ data: bytes }).promise; let text = "";
  for (let pageNumber = 1; pageNumber <= pdf.numPages && text.length < MAX_PDF_TEXT; pageNumber += 1) { const page = await pdf.getPage(pageNumber); const content = await page.getTextContent(); const pageText = content.items.map((item: any) => typeof item?.str === "string" ? item.str : "").join(" ").replace(/\s+/g, " ").trim(); if (pageText) text += `\n\n--- Page ${pageNumber} ---\n${pageText}`; page.cleanup(); }
  text = text.trim().slice(0, MAX_PDF_TEXT); if (!text) throw new Error("This PDF appears to be scanned/image-only. Text could not be extracted yet.");
  return { name: file.name, type: "application/pdf", dataUrl: "", extractedText: text };
}

export async function processAttachmentFiles(files: File[]): Promise<Attachment[]> { const accepted = files.slice(0, 4); return Promise.all(accepted.map((file) => file.type === "application/pdf" ? extractPdfText(file) : compressImage(file))); }

export default function FeatureInput({ feature, value, onChange, onSend, onClearFeature, disabled = false }: Props) {
  const galleryRef = useRef<HTMLInputElement>(null); const cameraRef = useRef<HTMLInputElement>(null); const pdfRef = useRef<HTMLInputElement>(null); const pickerRef = useRef<HTMLDivElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]); const [processing, setProcessing] = useState(false); const [error, setError] = useState(""); const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!showPicker) return;
    function handleOutsidePointer(event: PointerEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) setShowPicker(false);
    }
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [showPicker]);

  async function addFiles(files: FileList | null) { if (!files) return; setError(""); setShowPicker(false); const accepted = Array.from(files).slice(0, 4); if (!accepted.length) return; setProcessing(true); try { const next = await processAttachmentFiles(accepted); setAttachments((current) => [...current, ...next].slice(0, 4)); } catch (e) { console.error(e); setError(e instanceof Error ? e.message : "Could not process the attachment."); } finally { setProcessing(false); } }
  function sendAttachments() { if (!canSend || processing) return; const pending = attachments; setAttachments([]); onSend(pending); }
  const canSend = !disabled && !processing && (value.trim().length > 0 || attachments.length > 0);
  const hasTemporaryAttachment = attachments.length > 0;

  return <div ref={pickerRef} className="fixed bottom-[max(10px,env(safe-area-inset-bottom))] left-3 right-3 z-30 lg:hidden">
    {feature && <div className="mb-2 flex items-center gap-2 rounded-2xl border border-violet-400/20 bg-[#0b0b0b]/95 px-3 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,.5)] backdrop-blur-xl"><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-medium text-white/90">{feature.label}</p><p className="truncate text-[10px] text-white/35">{feature.hint}</p></div><button type="button" onClick={onClearFeature} aria-label="Change feature" className="flex h-7 w-7 items-center justify-center rounded-full text-white/45 hover:bg-white/10 hover:text-white"><X size={15} /></button></div>}
    {error && <div className="mb-2 rounded-2xl border border-red-400/20 bg-red-500/[.06] px-3 py-2 text-[11px] text-red-200">{error}</div>}
    {attachments.length > 0 && <div className="mb-2 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#090909]/95 p-2">{attachments.map((file, index) => <button key={`${file.name}-${index}`} type="button" onClick={() => setAttachments((items) => items.filter((_, i) => i !== index))} className="flex h-11 max-w-[180px] shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] px-2 text-left text-[10px] text-white/70">{file.type.startsWith("image/") ? <ImagePlus size={15} /> : <FileText size={15} />}<span className="truncate">{file.type === "application/pdf" ? "PDF" : "Image"}</span><X size={12} /></button>)}</div>}
    {showPicker && <div className="mb-2 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[#0b0b0b]/98 p-2 shadow-[0_10px_35px_rgba(0,0,0,.6)]"><button type="button" onClick={() => cameraRef.current?.click()} className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[10px] text-white/70 hover:bg-white/[.06]"><Camera size={20} /><span>Camera</span></button><button type="button" onClick={() => galleryRef.current?.click()} className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[10px] text-white/70 hover:bg-white/[.06]"><ImagePlus size={20} /><span>Gallery</span></button><button type="button" onClick={() => pdfRef.current?.click()} className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[10px] text-white/70 hover:bg-white/[.06]"><FileText size={20} /><span>PDF</span></button></div>}
    <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { void addFiles(e.target.files); e.currentTarget.value = ""; }} /><input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void addFiles(e.target.files); e.currentTarget.value = ""; }} /><input ref={pdfRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => { void addFiles(e.target.files); e.currentTarget.value = ""; }} />
    <div className="relative flex min-h-[60px] items-center gap-2 rounded-[28px] border border-white/[0.12] bg-black px-1.5 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,.65)]"><button type="button" onClick={() => setShowPicker((open) => !open)} disabled={disabled || processing} aria-label="Add attachment" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[.10] bg-white/[.035] text-white/75 active:scale-95 disabled:opacity-40"><Plus size={22} strokeWidth={1.7} /></button><input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAttachments(); } }} placeholder={processing ? "Reading PDF..." : feature ? "Add context for Theon..." : "Ask Theon anything..."} disabled={disabled || processing} className="h-11 min-w-0 flex-1 bg-transparent px-1 text-[15px] text-white outline-none placeholder:text-white/30" /><button onClick={sendAttachments} disabled={!canSend} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-500 to-cyan-400 text-black disabled:opacity-35"><ArrowUp size={21} /></button></div>
    {hasTemporaryAttachment && <p className="mt-1.5 text-center text-[9px] text-white/25">🔒 Images and PDFs are temporary and are deleted after this analysis. They aren&apos;t saved to your chat history.</p>}
  </div>;
}
