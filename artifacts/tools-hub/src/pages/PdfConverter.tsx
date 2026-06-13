import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import {
  FileText, Upload, Download, X, RefreshCw, Image, Link2,
  Scissors, Layers, RotateCw, AlignLeft, FileType,
  Minimize2, Trash2, Copy, GripVertical, Stamp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";
import { getSettings } from "@/hooks/useSettings";

type Mode =
  | "compress-pdf" | "merge-pdf"    | "split-pdf"    | "pdf-to-word"
  | "word-to-pdf"  | "pdf-to-image" | "image-to-pdf" | "rotate-pdf"
  | "delete-pages" | "extract-pages"| "watermark-pdf";

type CompressLevel = "lossless" | "balanced" | "small";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

let pdfjsLibCache: typeof import("pdfjs-dist") | null = null;
async function getPdfjsLib() {
  if (pdfjsLibCache) return pdfjsLibCache;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  pdfjsLibCache = lib;
  return lib;
}

async function renderPdfPages(file: File, scale: number, quality: number, onProgress?: (p: number) => void): Promise<Uint8Array> {
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const total = pdf.numPages;
  const newPdf = new jsPDF({ orientation: "portrait", unit: "px" });
  let first = true;
  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width; canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const pW = 595, pH = Math.round((vp.height / vp.width) * pW);
    if (first) { newPdf.internal.pageSize.width = pW; newPdf.internal.pageSize.height = pH; first = false; }
    else newPdf.addPage([pW, pH], pH > pW ? "portrait" : "landscape");
    newPdf.addImage(dataUrl, "JPEG", 0, 0, pW, pH);
    if (onProgress) onProgress(Math.round((i / total) * 100));
  }
  return newPdf.output("arraybuffer") as unknown as Uint8Array;
}

async function pdfToImages(file: File, onProgress?: (p: number) => void): Promise<string[]> {
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const total = pdf.numPages;
  const BATCH = 3;
  const results: string[] = new Array(total);
  for (let i = 0; i < total; i += BATCH) {
    await Promise.all(Array.from({ length: Math.min(BATCH, total - i) }, async (_, j) => {
      const page = await pdf.getPage(i + j + 1);
      const vp = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      canvas.width = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp }).promise;
      results[i + j] = canvas.toDataURL("image/jpeg", 0.92);
      if (onProgress) onProgress(Math.round(((i + j + 1) / total) * 100));
    }));
  }
  return results;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img); img.onerror = reject; img.src = src;
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

async function getPdfPageCount(file: File): Promise<number> {
  try {
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    return pdf.getPageCount();
  } catch { return 0; }
}

const TOOLS: { id: Mode; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "compress-pdf",  label: "Compress PDF",  icon: <Minimize2 className="w-5 h-5" />, color: "text-blue-500" },
  { id: "merge-pdf",     label: "Merge PDF",     icon: <Layers className="w-5 h-5" />,    color: "text-violet-500" },
  { id: "split-pdf",     label: "Split PDF",     icon: <Scissors className="w-5 h-5" />,  color: "text-orange-500" },
  { id: "pdf-to-word",   label: "PDF to Word",   icon: <AlignLeft className="w-5 h-5" />, color: "text-cyan-500" },
  { id: "word-to-pdf",   label: "Word to PDF",   icon: <FileType className="w-5 h-5" />,  color: "text-emerald-500" },
  { id: "pdf-to-image",  label: "PDF to Image",  icon: <Image className="w-5 h-5" />,     color: "text-pink-500" },
  { id: "image-to-pdf",  label: "Image to PDF",  icon: <FileText className="w-5 h-5" />,  color: "text-indigo-500" },
  { id: "rotate-pdf",    label: "Rotate PDF",    icon: <RotateCw className="w-5 h-5" />,  color: "text-yellow-500" },
  { id: "delete-pages",  label: "Delete Pages",  icon: <Trash2 className="w-5 h-5" />,    color: "text-red-500" },
  { id: "extract-pages", label: "Extract Pages", icon: <Copy className="w-5 h-5" />,      color: "text-teal-500" },
  { id: "watermark-pdf", label: "Watermark PDF", icon: <Stamp className="w-5 h-5" />,     color: "text-purple-500" },
];

const COMPRESS_LEVELS: { id: CompressLevel; label: string; desc: string; scale: number; quality: number }[] = [
  { id: "lossless", label: "High Quality", desc: "No quality loss, smaller size",      scale: 1.5, quality: 0.95 },
  { id: "balanced", label: "Balanced",     desc: "Good quality, significantly smaller", scale: 1.2, quality: 0.75 },
  { id: "small",    label: "Smallest",     desc: "Max compression, smaller file",      scale: 1.0, quality: 0.50 },
];

export default function PdfConverter() {
  useSEO({
    title: "Free PDF Tools — Compress, Merge, Split, Convert Online | ToolsHub",
    description: "10 free PDF tools: compress, merge, split, rotate, convert to image/word, delete or extract pages — all in your browser.",
  });

  const { count, increment } = useToolCounter("pdf-converter");
  const [mode, setMode] = useState<Mode>("compress-pdf");
  const [shareCopied, setShareCopied] = useState(false);

  // ── Compress ──
  const [compFile, setCompFile] = useState<File | null>(null);
  const [compLevel, setCompLevel] = useState<CompressLevel>(() => getSettings().pdfCompressLevel);
  const [compLoading, setCompLoading] = useState(false);
  const [compProgress, setCompProgress] = useState(0);
  const [compResult, setCompResult] = useState<{ orig: number; neo: number } | null>(null);
  const [compError, setCompError] = useState("");
  const compRef = useRef<HTMLInputElement>(null);

  // ── Merge ──
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeError, setMergeError] = useState("");
  const [mergeDragIdx, setMergeDragIdx] = useState<number | null>(null);
  const mergeRef = useRef<HTMLInputElement>(null);

  // ── Split ──
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitLoading, setSplitLoading] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);
  const [splitDone, setSplitDone] = useState(false);
  const [splitError, setSplitError] = useState("");
  const splitRef = useRef<HTMLInputElement>(null);

  // ── PDF to Word ──
  const [p2wFile, setP2wFile] = useState<File | null>(null);
  const [p2wLoading, setP2wLoading] = useState(false);
  const [p2wProgress, setP2wProgress] = useState(0);
  const [p2wText, setP2wText] = useState("");
  const [p2wCopied, setP2wCopied] = useState(false);
  const [p2wError, setP2wError] = useState("");
  const p2wRef = useRef<HTMLInputElement>(null);

  // ── Word to PDF ──
  const [w2pFile, setW2pFile] = useState<File | null>(null);
  const [w2pLoading, setW2pLoading] = useState(false);
  const [w2pError, setW2pError] = useState("");
  const w2pRef = useRef<HTMLInputElement>(null);

  // ── PDF to Image ──
  const [p2iFile, setP2iFile] = useState<File | null>(null);
  const [p2iImages, setP2iImages] = useState<string[]>([]);
  const [p2iLoading, setP2iLoading] = useState(false);
  const [p2iProgress, setP2iProgress] = useState(0);
  const [p2iError, setP2iError] = useState("");
  const p2iRef = useRef<HTMLInputElement>(null);

  // ── Image to PDF ──
  const [i2pFiles, setI2pFiles] = useState<File[]>([]);
  const [i2pPreviews, setI2pPreviews] = useState<string[]>([]);
  const [i2pLoading, setI2pLoading] = useState(false);
  const i2pRef = useRef<HTMLInputElement>(null);

  // ── Rotate ──
  const [rotFile, setRotFile] = useState<File | null>(null);
  const [rotDeg, setRotDeg] = useState<90 | 180 | 270>(90);
  const [rotLoading, setRotLoading] = useState(false);
  const [rotDone, setRotDone] = useState(false);
  const [rotError, setRotError] = useState("");
  const rotRef = useRef<HTMLInputElement>(null);

  // ── Delete / Extract Pages (shared page-chip state) ──
  const [delFile, setDelFile] = useState<File | null>(null);
  const [delTotal, setDelTotal] = useState(0);
  const [delSelected, setDelSelected] = useState<Set<number>>(new Set());
  const [delLoading, setDelLoading] = useState(false);
  const [delDone, setDelDone] = useState(false);
  const [delError, setDelError] = useState("");
  const delRef = useRef<HTMLInputElement>(null);

  const [extFile, setExtFile] = useState<File | null>(null);
  const [extTotal, setExtTotal] = useState(0);
  const [extSelected, setExtSelected] = useState<Set<number>>(new Set());
  const [extLoading, setExtLoading] = useState(false);
  const [extDone, setExtDone] = useState(false);
  const [extError, setExtError] = useState("");
  const extRef = useRef<HTMLInputElement>(null);

  // ── Watermark ──
  const [wmFile, setWmFile] = useState<File | null>(null);
  const [wmText, setWmText] = useState("CONFIDENTIAL");
  const [wmOpacity, setWmOpacity] = useState(30);
  const [wmColor, setWmColor] = useState<"gray" | "red" | "blue" | "black">("gray");
  const [wmSize, setWmSize] = useState<"small" | "medium" | "large">("medium");
  const [wmLoading, setWmLoading] = useState(false);
  const [wmDone, setWmDone] = useState(false);
  const [wmError, setWmError] = useState("");
  const wmRef = useRef<HTMLInputElement>(null);

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  // ── Compress ─────────────────────────────────────────────
  const handleCompFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setCompFile(f); setCompResult(null); setCompError(""); setCompProgress(0);
  };
  const compressPdf = async () => {
    if (!compFile) return;
    setCompLoading(true); setCompError(""); setCompProgress(0);
    try {
      const level = COMPRESS_LEVELS.find((l) => l.id === compLevel)!;
      let output: Uint8Array;
      if (compLevel === "lossless") {
        const pdf = await PDFDocument.load(await compFile.arrayBuffer(), { updateMetadata: false });
        output = await pdf.save({ useObjectStreams: true });
        setCompProgress(100);
      } else {
        output = await renderPdfPages(compFile, level.scale, level.quality, setCompProgress);
      }
      const blob = new Blob([output], { type: "application/pdf" });
      triggerDownload(blob, compFile.name.replace(".pdf", "-compressed.pdf"));
      setCompResult({ orig: compFile.size, neo: output.byteLength });
      increment();
    } catch { setCompError("Failed to compress PDF."); }
    finally { setCompLoading(false); }
  };

  // ── Merge (drag-to-reorder) ───────────────────────────────
  const handleMergeAdd = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    setMergeFiles((p) => [...p, ...arr]); setMergeError("");
  };
  const mergePdfs = async () => {
    if (mergeFiles.length < 2) { setMergeError("Please add at least 2 PDF files."); return; }
    setMergeLoading(true); setMergeError("");
    try {
      const merged = await PDFDocument.create();
      for (const file of mergeFiles) {
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        (await merged.copyPages(pdf, pdf.getPageIndices())).forEach((p) => merged.addPage(p));
      }
      triggerDownload(new Blob([await merged.save()], { type: "application/pdf" }), "merged.pdf");
      increment();
    } catch { setMergeError("Failed to merge PDFs."); }
    finally { setMergeLoading(false); }
  };
  const handleMergeDragStart = (idx: number) => setMergeDragIdx(idx);
  const handleMergeDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (mergeDragIdx === null || mergeDragIdx === idx) return;
    const next = [...mergeFiles];
    const [item] = next.splice(mergeDragIdx, 1);
    next.splice(idx, 0, item);
    setMergeFiles(next);
    setMergeDragIdx(idx);
  };

  // ── Split ─────────────────────────────────────────────────
  const handleSplitFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setSplitFile(f); setSplitError(""); setSplitDone(false);
  };
  const splitPdf = async () => {
    if (!splitFile) return;
    setSplitLoading(true); setSplitProgress(0); setSplitError(""); setSplitDone(false);
    try {
      const src = await PDFDocument.load(await splitFile.arrayBuffer());
      const total = src.getPageCount();
      const zip = new JSZip();
      for (let i = 0; i < total; i++) {
        const p = await PDFDocument.create();
        const [pg] = await p.copyPages(src, [i]);
        p.addPage(pg);
        zip.file(`page-${i + 1}.pdf`, await p.save());
        setSplitProgress(Math.round(((i + 1) / total) * 100));
      }
      triggerDownload(await zip.generateAsync({ type: "blob" }), splitFile.name.replace(".pdf", "-split.zip"));
      setSplitDone(true); increment();
    } catch { setSplitError("Failed to split PDF."); }
    finally { setSplitLoading(false); }
  };

  // ── PDF to Word ───────────────────────────────────────────
  const handleP2wFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setP2wFile(f); setP2wText(""); setP2wError("");
  };
  const pdfToWord = async () => {
    if (!p2wFile) return;
    setP2wLoading(true); setP2wProgress(0); setP2wError("");
    try {
      const pdfjsLib = await getPdfjsLib();
      const pdf = await pdfjsLib.getDocument({ data: await p2wFile.arrayBuffer() }).promise;
      const total = pdf.numPages;
      const lines: string[] = [];
      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((item: unknown) => ("str" in (item as object) ? (item as { str: string }).str : ""))
          .join(" ").replace(/\s+/g, " ").trim();
        if (text) lines.push(`--- Page ${i} ---\n${text}`);
        setP2wProgress(Math.round((i / total) * 100));
      }
      const fullText = lines.join("\n\n");
      setP2wText(fullText);
      triggerDownload(new Blob([fullText], { type: "text/plain" }), p2wFile.name.replace(".pdf", ".txt"));
      increment();
    } catch { setP2wError("Failed to extract text."); }
    finally { setP2wLoading(false); }
  };

  // ── Word to PDF ───────────────────────────────────────────
  const handleW2pFile = (f: File) => {
    if (!f.name.toLowerCase().match(/\.(docx|doc)$/)) return;
    setW2pFile(f); setW2pError("");
  };
  const wordToPdf = async () => {
    if (!w2pFile) return;
    setW2pLoading(true); setW2pError("");
    try {
      const mammoth = await import("mammoth");
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await w2pFile.arrayBuffer() });
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:210mm;height:297mm;";
      document.body.appendChild(iframe);
      const iDoc = iframe.contentDocument!;
      iDoc.open();
      iDoc.write(`<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.5;margin:20mm;color:#000}h1,h2,h3{margin:.5em 0}p{margin:.3em 0}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 8px}img{max-width:100%}</style></head><body>${html}</body></html>`);
      iDoc.close();
      await new Promise((r) => setTimeout(r, 800));
      iframe.contentWindow!.focus(); iframe.contentWindow!.print();
      document.body.removeChild(iframe);
      increment();
    } catch { setW2pError("Failed to convert. Make sure it is a valid .docx file."); }
    finally { setW2pLoading(false); }
  };

  // ── PDF to Image ──────────────────────────────────────────
  const handleP2iFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setP2iFile(f); setP2iImages([]); setP2iError("");
  };
  const convertPdfToImages = async () => {
    if (!p2iFile) return;
    setP2iLoading(true); setP2iProgress(0); setP2iError("");
    try {
      setP2iImages(await pdfToImages(p2iFile, setP2iProgress));
      increment();
    } catch { setP2iError("Failed to convert PDF."); }
    finally { setP2iLoading(false); }
  };

  // ── Image to PDF ──────────────────────────────────────────
  const handleI2pFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setI2pFiles((p) => [...p, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => { if (e.target?.result) setI2pPreviews((p) => [...p, e.target!.result as string]); };
      reader.readAsDataURL(f);
    });
  };
  const buildPdf = async () => {
    if (!i2pPreviews.length) return;
    setI2pLoading(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "px" });
      let first = true;
      for (const src of i2pPreviews) {
        const img = await loadImage(src);
        const w = img.naturalWidth || 800, h = img.naturalHeight || 600;
        const pW = 595, pH = Math.round(h * (pW / w));
        if (first) { pdf.internal.pageSize.width = pW; pdf.internal.pageSize.height = pH; first = false; }
        else pdf.addPage([pW, pH], pH > pW ? "portrait" : "landscape");
        pdf.addImage(src, "JPEG", 0, 0, pW, pH);
      }
      pdf.save("converted.pdf"); increment();
    } catch (e) { console.error(e); }
    finally { setI2pLoading(false); }
  };

  // ── Rotate ────────────────────────────────────────────────
  const handleRotFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setRotFile(f); setRotError(""); setRotDone(false);
  };
  const rotatePdf = async () => {
    if (!rotFile) return;
    setRotLoading(true); setRotError(""); setRotDone(false);
    try {
      const pdf = await PDFDocument.load(await rotFile.arrayBuffer());
      pdf.getPages().forEach((p) => p.setRotation(degrees((p.getRotation().angle + rotDeg) % 360)));
      triggerDownload(new Blob([await pdf.save()], { type: "application/pdf" }), rotFile.name.replace(".pdf", "-rotated.pdf"));
      setRotDone(true); increment();
    } catch { setRotError("Failed to rotate PDF."); }
    finally { setRotLoading(false); }
  };

  // ── Delete Pages ──────────────────────────────────────────
  const handleDelFile = async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setDelFile(f); setDelSelected(new Set()); setDelError(""); setDelDone(false);
    setDelTotal(await getPdfPageCount(f));
  };
  const toggleDel = (n: number) => setDelSelected((s) => { const next = new Set(s); next.has(n) ? next.delete(n) : next.add(n); return next; });
  const deletePages = async () => {
    if (!delFile || delSelected.size === 0) { setDelError("Select at least one page to delete."); return; }
    setDelLoading(true); setDelError(""); setDelDone(false);
    try {
      const pdf = await PDFDocument.load(await delFile.arrayBuffer());
      const total = pdf.getPageCount();
      const keep = Array.from({ length: total }, (_, i) => i).filter((i) => !delSelected.has(i + 1));
      if (!keep.length) { setDelError("Cannot delete all pages."); setDelLoading(false); return; }
      const newPdf = await PDFDocument.create();
      (await newPdf.copyPages(pdf, keep)).forEach((p) => newPdf.addPage(p));
      triggerDownload(new Blob([await newPdf.save()], { type: "application/pdf" }), delFile.name.replace(".pdf", "-edited.pdf"));
      setDelDone(true); increment();
    } catch { setDelError("Failed to delete pages."); }
    finally { setDelLoading(false); }
  };

  // ── Extract Pages ─────────────────────────────────────────
  const handleExtFile = async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setExtFile(f); setExtSelected(new Set()); setExtError(""); setExtDone(false);
    setExtTotal(await getPdfPageCount(f));
  };
  const toggleExt = (n: number) => setExtSelected((s) => { const next = new Set(s); next.has(n) ? next.delete(n) : next.add(n); return next; });
  const extractPages = async () => {
    if (!extFile || extSelected.size === 0) { setExtError("Select at least one page to extract."); return; }
    setExtLoading(true); setExtError(""); setExtDone(false);
    try {
      const pdf = await PDFDocument.load(await extFile.arrayBuffer());
      const toExtract = [...extSelected].sort((a, b) => a - b).map((n) => n - 1);
      const newPdf = await PDFDocument.create();
      (await newPdf.copyPages(pdf, toExtract)).forEach((p) => newPdf.addPage(p));
      triggerDownload(new Blob([await newPdf.save()], { type: "application/pdf" }), extFile.name.replace(".pdf", "-extracted.pdf"));
      setExtDone(true); increment();
    } catch { setExtError("Failed to extract pages."); }
    finally { setExtLoading(false); }
  };

  // ── Watermark ─────────────────────────────────────────────
  const WM_COLORS: Record<string, [number, number, number]> = {
    gray: [0.5, 0.5, 0.5], red: [0.8, 0.1, 0.1], blue: [0.1, 0.2, 0.8], black: [0, 0, 0],
  };
  const WM_SIZES: Record<string, number> = { small: 36, medium: 52, large: 72 };
  const handleWmFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setWmFile(f); setWmError(""); setWmDone(false);
  };
  const applyWatermark = async () => {
    if (!wmFile || !wmText.trim()) { setWmError("Enter watermark text first."); return; }
    setWmLoading(true); setWmError(""); setWmDone(false);
    try {
      const pdf = await PDFDocument.load(await wmFile.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const [r, g, b] = WM_COLORS[wmColor];
      const fontSize = WM_SIZES[wmSize];
      const opacity = wmOpacity / 100;
      for (const page of pdf.getPages()) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(wmText, fontSize);
        page.drawText(wmText, {
          x: (width - textWidth) / 2,
          y: (height - fontSize) / 2,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(45),
          blendMode: undefined,
        });
      }
      triggerDownload(new Blob([await pdf.save()], { type: "application/pdf" }), wmFile.name.replace(".pdf", "-watermarked.pdf"));
      setWmDone(true); increment();
    } catch { setWmError("Failed to add watermark."); }
    finally { setWmLoading(false); }
  };

  const activeTool = TOOLS.find((t) => t.id === mode)!;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <FileText className="w-3.5 h-3.5" /><span>PDF Tools</span>
              <UsageCount count={count} label="operation" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">PDF Tools</h1>
            <p className="text-muted-foreground mt-2">10 essential PDF tools — everything runs in your browser, nothing uploaded.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleShareLink} className="gap-2 text-xs">
            {shareCopied ? <><Upload className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Link2 className="w-3.5 h-3.5" />Share</>}
          </Button>
        </div>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
        {TOOLS.map((tool) => {
          const active = mode === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setMode(tool.id)}
              data-testid={`tab-${tool.id}`}
              className={`relative flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border transition-all duration-150 text-center ${
                active
                  ? "bg-primary border-primary text-primary-foreground shadow-md scale-[1.03]"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <span className={active ? "text-primary-foreground" : tool.color}>{tool.icon}</span>
              <span className="text-[11px] font-semibold leading-tight">{tool.label}</span>
              {active && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-primary rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Active Tool Banner */}
      <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl border bg-muted/30">
        <span className={activeTool.color}>{activeTool.icon}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{activeTool.label}</p>
          <p className="text-xs text-muted-foreground">{getToolDesc(mode)}</p>
        </div>
      </div>

      {/* ── Compress PDF ── */}
      {mode === "compress-pdf" && (
        <div className="space-y-4">
          {/* Compression Level Selector */}
          <div className="grid grid-cols-3 gap-2">
            {COMPRESS_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setCompLevel(lvl.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  compLevel === lvl.id
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-card border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <p className="text-xs font-semibold">{lvl.label}</p>
                <p className="text-[10px] mt-0.5 leading-tight">{lvl.desc}</p>
              </button>
            ))}
          </div>
          {!compFile ? (
            <PdfDrop label="Upload PDF to compress" onClick={() => compRef.current?.click()} onDrop={handleCompFile} testId="dropzone-compress">
              <input ref={compRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleCompFile(e.target.files[0])} />
            </PdfDrop>
          ) : (
            <>
              <FileCard name={compFile.name} size={compFile.size} onRemove={() => { setCompFile(null); setCompResult(null); }} />
              {compError && <ErrorBox msg={compError} />}
              {compLoading && <ProgressBar value={compProgress} label="Compressing..." />}
              {compResult && (
                <div className={`px-4 py-3 rounded-xl text-sm font-medium ${compResult.neo < compResult.orig ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted/60 text-muted-foreground"}`}>
                  {compResult.neo < compResult.orig
                    ? `✅ Saved ${Math.round((1 - compResult.neo / compResult.orig) * 100)}% — ${formatBytes(compResult.orig)} → ${formatBytes(compResult.neo)}`
                    : `ℹ️ Already optimized (${formatBytes(compResult.neo)})`}
                </div>
              )}
              <Button onClick={compressPdf} disabled={compLoading}>
                {compLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Compressing...</> : <><Minimize2 className="w-4 h-4 mr-2" />Compress & Download</>}
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Merge PDF (drag-to-reorder) ── */}
      {mode === "merge-pdf" && (
        <div className="space-y-4">
          <PdfDrop label="Drop PDFs here — multiple allowed" sub="Pages merged in order shown below" onClick={() => mergeRef.current?.click()} onDrop={(f) => handleMergeAdd([f])} testId="dropzone-merge">
            <input ref={mergeRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => e.target.files && handleMergeAdd(e.target.files)} />
          </PdfDrop>
          {mergeFiles.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{mergeFiles.length} file{mergeFiles.length > 1 ? "s" : ""} — <span className="text-muted-foreground text-xs">drag to reorder</span></p>
                <Button variant="ghost" size="sm" onClick={() => setMergeFiles([])}>Clear all</Button>
              </div>
              <div className="space-y-2">
                {mergeFiles.map((f, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => handleMergeDragStart(i)}
                    onDragOver={(e) => handleMergeDragOver(e, i)}
                    onDragEnd={() => setMergeDragIdx(null)}
                    className={`flex items-center gap-3 bg-card border rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing select-none transition-all ${mergeDragIdx === i ? "border-primary shadow-md opacity-70" : "border-border"}`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                    <button onClick={() => setMergeFiles((p) => p.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              {mergeError && <ErrorBox msg={mergeError} />}
              <Button onClick={mergePdfs} disabled={mergeLoading || mergeFiles.length < 2}>
                {mergeLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Merging...</> : <><Download className="w-4 h-4 mr-2" />Merge & Download</>}
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Split PDF ── */}
      {mode === "split-pdf" && (
        <div className="space-y-4">
          {!splitFile ? (
            <PdfDrop label="Upload PDF to split" onClick={() => splitRef.current?.click()} onDrop={handleSplitFile} testId="dropzone-split">
              <input ref={splitRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleSplitFile(e.target.files[0])} />
            </PdfDrop>
          ) : (
            <>
              <FileCard name={splitFile.name} size={splitFile.size} onRemove={() => { setSplitFile(null); setSplitDone(false); }} />
              {splitError && <ErrorBox msg={splitError} />}
              {splitLoading && <ProgressBar value={splitProgress} label="Splitting pages..." />}
              {splitDone && <SuccessBox msg="Each page saved as separate PDF — downloaded as ZIP!" />}
              <Button onClick={splitPdf} disabled={splitLoading}>
                {splitLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Splitting... {splitProgress}%</> : <><Scissors className="w-4 h-4 mr-2" />Split into Pages</>}
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── PDF to Word ── */}
      {mode === "pdf-to-word" && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs px-4 py-3 rounded-lg">
            💡 Extracts text from PDF. Works best with text-based PDFs (not scanned/image PDFs).
          </div>
          {!p2wFile ? (
            <PdfDrop label="Upload PDF to extract text" onClick={() => p2wRef.current?.click()} onDrop={handleP2wFile} testId="dropzone-p2w">
              <input ref={p2wRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleP2wFile(e.target.files[0])} />
            </PdfDrop>
          ) : (
            <>
              <FileCard name={p2wFile.name} size={p2wFile.size} onRemove={() => { setP2wFile(null); setP2wText(""); }} />
              {p2wError && <ErrorBox msg={p2wError} />}
              {p2wLoading && <ProgressBar value={p2wProgress} label="Extracting text..." />}
              <Button onClick={pdfToWord} disabled={p2wLoading}>
                {p2wLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Extracting... {p2wProgress}%</> : <><Download className="w-4 h-4 mr-2" />Extract & Download .txt</>}
              </Button>
              {p2wText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{p2wText.length.toLocaleString()} characters</p>
                    <Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(p2wText); setP2wCopied(true); setTimeout(() => setP2wCopied(false), 2000); }}>
                      {p2wCopied ? "Copied!" : "Copy text"}
                    </Button>
                  </div>
                  <pre className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-auto max-h-64 text-foreground">{p2wText}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Word to PDF ── */}
      {mode === "word-to-pdf" && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs px-4 py-3 rounded-lg">
            💡 When the print dialog opens, choose <strong>"Save as PDF"</strong> as the printer.
          </div>
          {!w2pFile ? (
            <PdfDrop label="Upload Word document (.docx)" sub=".doc or .docx files only" onClick={() => w2pRef.current?.click()} onDrop={handleW2pFile} testId="dropzone-w2p">
              <input ref={w2pRef} type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(e) => e.target.files?.[0] && handleW2pFile(e.target.files[0])} />
            </PdfDrop>
          ) : (
            <>
              <FileCard name={w2pFile.name} size={w2pFile.size} onRemove={() => setW2pFile(null)} />
              {w2pError && <ErrorBox msg={w2pError} />}
              <Button onClick={wordToPdf} disabled={w2pLoading}>
                {w2pLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Opening print dialog...</> : <><FileType className="w-4 h-4 mr-2" />Convert to PDF</>}
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── PDF to Image ── */}
      {mode === "pdf-to-image" && (
        <div className="space-y-4">
          {!p2iFile ? (
            <PdfDrop label="Upload PDF to convert to images" onClick={() => p2iRef.current?.click()} onDrop={handleP2iFile} testId="dropzone-p2i">
              <input ref={p2iRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleP2iFile(e.target.files[0])} />
            </PdfDrop>
          ) : (
            <>
              <FileCard name={p2iFile.name} size={p2iFile.size} onRemove={() => { setP2iFile(null); setP2iImages([]); }} />
              {p2iError && <ErrorBox msg={p2iError} />}
              {p2iLoading && <ProgressBar value={p2iProgress} label="Converting pages..." />}
              <div className="flex gap-3 flex-wrap">
                <Button onClick={convertPdfToImages} disabled={p2iLoading}>
                  {p2iLoading ? "Converting..." : "Convert to Images"}
                </Button>
                {p2iImages.length > 0 && (
                  <Button variant="outline" onClick={() => p2iImages.forEach((src, i) => { const a = document.createElement("a"); a.href = src; a.download = `page-${i + 1}.jpg`; a.click(); })}>
                    <Download className="w-4 h-4 mr-2" />Download All
                  </Button>
                )}
              </div>
              {p2iImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {p2iImages.map((src, i) => (
                    <div key={i} className="group relative rounded-lg border border-border overflow-hidden">
                      <img src={src} alt={`Page ${i + 1}`} className="w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="secondary" onClick={() => { const a = document.createElement("a"); a.href = src; a.download = `page-${i + 1}.jpg`; a.click(); }}>
                          <Download className="w-3.5 h-3.5 mr-1" />Pg {i + 1}
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">Page {i + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Image to PDF ── */}
      {mode === "image-to-pdf" && (
        <div className="space-y-4">
          <ImageDrop onClick={() => i2pRef.current?.click()} onDrop={(f) => handleI2pFiles([f])} testId="dropzone-images">
            <input ref={i2pRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleI2pFiles(e.target.files)} />
          </ImageDrop>
          {i2pPreviews.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{i2pPreviews.length} image{i2pPreviews.length > 1 ? "s" : ""} selected</p>
                <Button variant="ghost" size="sm" onClick={() => { setI2pFiles([]); setI2pPreviews([]); }}>Clear all</Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {i2pPreviews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg border border-border overflow-hidden aspect-square">
                    <img src={src} alt={i2pFiles[i]?.name} className="w-full h-full object-cover" loading="lazy" />
                    <button onClick={() => { setI2pFiles((p) => p.filter((_, j) => j !== i)); setI2pPreviews((p) => p.filter((_, j) => j !== i)); }} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-white"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <Button onClick={buildPdf} disabled={i2pLoading}>
                {i2pLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Building...</> : <><Download className="w-4 h-4 mr-2" />Download PDF</>}
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Rotate PDF ── */}
      {mode === "rotate-pdf" && (
        <div className="space-y-4">
          {!rotFile ? (
            <PdfDrop label="Upload PDF to rotate" onClick={() => rotRef.current?.click()} onDrop={handleRotFile} testId="dropzone-rotate">
              <input ref={rotRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleRotFile(e.target.files[0])} />
            </PdfDrop>
          ) : (
            <>
              <FileCard name={rotFile.name} size={rotFile.size} onRemove={() => { setRotFile(null); setRotDone(false); }} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rotation angle (all pages)</label>
                <div className="flex gap-2">
                  {([90, 180, 270] as const).map((deg) => (
                    <button key={deg} onClick={() => setRotDeg(deg)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${rotDeg === deg ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/50"}`}>
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
              {rotError && <ErrorBox msg={rotError} />}
              {rotDone && <SuccessBox msg="Rotated PDF downloaded!" />}
              <Button onClick={rotatePdf} disabled={rotLoading}>
                {rotLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Rotating...</> : <><RotateCw className="w-4 h-4 mr-2" />Rotate & Download</>}
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Delete Pages (visual chip selector) ── */}
      {mode === "delete-pages" && (
        <div className="space-y-4">
          {!delFile ? (
            <PdfDrop label="Upload PDF to remove pages from" onClick={() => delRef.current?.click()} onDrop={handleDelFile} testId="dropzone-delete">
              <input ref={delRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleDelFile(e.target.files[0])} />
            </PdfDrop>
          ) : (
            <>
              <FileCard name={delFile.name} size={delFile.size} onRemove={() => { setDelFile(null); setDelDone(false); setDelTotal(0); setDelSelected(new Set()); }} />
              {delTotal > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Select pages to delete ({delTotal} total)</label>
                    <div className="flex gap-2">
                      <button onClick={() => setDelSelected(new Set(Array.from({ length: delTotal }, (_, i) => i + 1)))} className="text-xs text-primary hover:underline">All</button>
                      <span className="text-muted-foreground text-xs">·</span>
                      <button onClick={() => setDelSelected(new Set())} className="text-xs text-muted-foreground hover:underline">None</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: Math.min(delTotal, 100) }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => toggleDel(n)}
                        className={`w-9 h-9 rounded-lg text-xs font-semibold border transition-all ${
                          delSelected.has(n)
                            ? "bg-red-500 text-white border-red-500 shadow-sm"
                            : "bg-card border-border text-muted-foreground hover:border-red-400 hover:text-red-500"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    {delTotal > 100 && <span className="text-xs text-muted-foreground self-center">...and {delTotal - 100} more</span>}
                  </div>
                  {delSelected.size > 0 && (
                    <p className="text-xs text-muted-foreground">{delSelected.size} page{delSelected.size > 1 ? "s" : ""} selected — {delTotal - delSelected.size} will remain</p>
                  )}
                </div>
              )}
              {delError && <ErrorBox msg={delError} />}
              {delDone && <SuccessBox msg="Pages deleted — new PDF downloaded!" />}
              <Button onClick={deletePages} disabled={delLoading} variant={delSelected.size > 0 ? "destructive" : "default"}>
                {delLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><Trash2 className="w-4 h-4 mr-2" />Delete {delSelected.size > 0 ? `${delSelected.size} Page${delSelected.size > 1 ? "s" : ""}` : "Pages"} & Download</>}
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Extract Pages (visual chip selector) ── */}
      {mode === "extract-pages" && (
        <div className="space-y-4">
          {!extFile ? (
            <PdfDrop label="Upload PDF to extract pages from" onClick={() => extRef.current?.click()} onDrop={handleExtFile} testId="dropzone-extract">
              <input ref={extRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleExtFile(e.target.files[0])} />
            </PdfDrop>
          ) : (
            <>
              <FileCard name={extFile.name} size={extFile.size} onRemove={() => { setExtFile(null); setExtDone(false); setExtTotal(0); setExtSelected(new Set()); }} />
              {extTotal > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Select pages to extract ({extTotal} total)</label>
                    <div className="flex gap-2">
                      <button onClick={() => setExtSelected(new Set(Array.from({ length: extTotal }, (_, i) => i + 1)))} className="text-xs text-primary hover:underline">All</button>
                      <span className="text-muted-foreground text-xs">·</span>
                      <button onClick={() => setExtSelected(new Set())} className="text-xs text-muted-foreground hover:underline">None</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: Math.min(extTotal, 100) }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => toggleExt(n)}
                        className={`w-9 h-9 rounded-lg text-xs font-semibold border transition-all ${
                          extSelected.has(n)
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    {extTotal > 100 && <span className="text-xs text-muted-foreground self-center">...and {extTotal - 100} more</span>}
                  </div>
                  {extSelected.size > 0 && (
                    <p className="text-xs text-muted-foreground">{extSelected.size} page{extSelected.size > 1 ? "s" : ""} will be extracted into a new PDF</p>
                  )}
                </div>
              )}
              {extError && <ErrorBox msg={extError} />}
              {extDone && <SuccessBox msg="Selected pages extracted — new PDF downloaded!" />}
              <Button onClick={extractPages} disabled={extLoading}>
                {extLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><Copy className="w-4 h-4 mr-2" />Extract {extSelected.size > 0 ? `${extSelected.size} Page${extSelected.size > 1 ? "s" : ""}` : "Pages"} & Download</>}
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Watermark PDF ── */}
      {mode === "watermark-pdf" && (
        <div className="space-y-4">
          {/* Watermark text */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Watermark text</label>
            <input
              type="text"
              value={wmText}
              onChange={(e) => setWmText(e.target.value)}
              placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
              maxLength={40}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Options row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Color</label>
              <div className="flex gap-1.5">
                {(["gray","red","blue","black"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setWmColor(c)}
                    title={c}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${wmColor === c ? "border-primary scale-110 shadow" : "border-transparent hover:border-muted-foreground"}`}
                    style={{ backgroundColor: c === "gray" ? "#888" : c === "red" ? "#c0392b" : c === "blue" ? "#1a3ab0" : "#111" }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Text size</label>
              <div className="flex gap-1">
                {(["small","medium","large"] as const).map((s) => (
                  <button key={s} onClick={() => setWmSize(s)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${wmSize === s ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}>
                    {s === "small" ? "S" : s === "medium" ? "M" : "L"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Opacity slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Opacity</label>
              <span className="text-xs font-mono text-primary">{wmOpacity}%</span>
            </div>
            <input
              type="range"
              min={5} max={80} step={5}
              value={wmOpacity}
              onChange={(e) => setWmOpacity(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Subtle</span><span>Visible</span>
            </div>
          </div>

          {/* Preview badge */}
          {wmText && (
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted/20 h-28 flex items-center justify-center">
              <p className="text-xs text-muted-foreground absolute top-2 left-3">Preview</p>
              <span
                className="font-bold select-none rotate-45 tracking-widest"
                style={{
                  fontSize: wmSize === "small" ? 18 : wmSize === "medium" ? 26 : 36,
                  color: wmColor === "gray" ? "#888" : wmColor === "red" ? "#c0392b" : wmColor === "blue" ? "#1a3ab0" : "#111",
                  opacity: wmOpacity / 100,
                }}
              >
                {wmText}
              </span>
            </div>
          )}

          {/* File upload */}
          {!wmFile ? (
            <PdfDrop label="Upload PDF to watermark" onClick={() => wmRef.current?.click()} onDrop={handleWmFile} testId="dropzone-watermark">
              <input ref={wmRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleWmFile(e.target.files[0])} />
            </PdfDrop>
          ) : (
            <>
              <FileCard name={wmFile.name} size={wmFile.size} onRemove={() => { setWmFile(null); setWmDone(false); }} />
              {wmError && <ErrorBox msg={wmError} />}
              {wmDone && <SuccessBox msg="Watermarked PDF downloaded!" />}
              <Button onClick={applyWatermark} disabled={wmLoading || !wmText.trim()}>
                {wmLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Applying...</> : <><Stamp className="w-4 h-4 mr-2" />Apply Watermark & Download</>}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function getToolDesc(mode: Mode): string {
  const map: Record<Mode, string> = {
    "compress-pdf":  "Reduce PDF file size — choose High Quality, Balanced, or Smallest",
    "merge-pdf":     "Combine multiple PDFs — drag rows to reorder before merging",
    "split-pdf":     "Split every page into a separate PDF, download as ZIP",
    "pdf-to-word":   "Extract all text from PDF and download as .txt",
    "word-to-pdf":   "Convert .docx Word document to PDF via browser print",
    "pdf-to-image":  "Convert each PDF page to a JPG image",
    "image-to-pdf":  "Combine multiple images into a single PDF file",
    "rotate-pdf":    "Rotate all pages by 90°, 180°, or 270°",
    "delete-pages":  "Click page numbers to select which pages to remove",
    "extract-pages": "Click page numbers to select which pages to keep",
    "watermark-pdf": "Stamp diagonal text on every page — set color, size & opacity",
  };
  return map[mode];
}

function PdfDrop({ label, sub, onClick, onDrop, testId, children }: {
  label: string; sub?: string; onClick: () => void; onDrop: (f: File) => void; testId: string; children?: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onDrop(f); }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      data-testid={testId}
      className={`relative rounded-2xl py-14 px-8 text-center overflow-hidden select-none ${over ? "dropzone-active" : "dropzone-idle"}`}
    >
      <span className={`absolute top-3 left-3 w-5 h-5 border-t-[2.5px] border-l-[2.5px] rounded-tl transition-colors duration-200 ${over ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute top-3 right-3 w-5 h-5 border-t-[2.5px] border-r-[2.5px] rounded-tr transition-colors duration-200 ${over ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute bottom-3 left-3 w-5 h-5 border-b-[2.5px] border-l-[2.5px] rounded-bl transition-colors duration-200 ${over ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute bottom-3 right-3 w-5 h-5 border-b-[2.5px] border-r-[2.5px] rounded-br transition-colors duration-200 ${over ? "border-primary" : "border-primary/40"}`} />
      <button type="button" onClick={onClick} className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${over ? "bg-primary scale-105 shadow-primary/40" : "bg-primary hover:bg-primary/90 hover:scale-[1.02] shadow-primary/25"}`}>
        <FileText className="w-4 h-4" />
        {label}
      </button>
      <p className={`mt-4 text-xs transition-colors duration-200 ${over ? "text-primary font-medium" : "text-muted-foreground"}`}>{over ? "Release to upload" : (sub ?? "PDF files only · or drop here")}</p>
      {children}
    </div>
  );
}

function ImageDrop({ onClick, onDrop, testId, children }: {
  onClick: () => void; onDrop: (f: File) => void; testId: string; children?: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onDrop(f); }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      data-testid={testId}
      className={`relative rounded-2xl py-14 px-8 text-center overflow-hidden select-none ${over ? "dropzone-active" : "dropzone-idle"}`}
    >
      <span className={`absolute top-3 left-3 w-5 h-5 border-t-[2.5px] border-l-[2.5px] rounded-tl transition-colors duration-200 ${over ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute top-3 right-3 w-5 h-5 border-t-[2.5px] border-r-[2.5px] rounded-tr transition-colors duration-200 ${over ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute bottom-3 left-3 w-5 h-5 border-b-[2.5px] border-l-[2.5px] rounded-bl transition-colors duration-200 ${over ? "border-primary" : "border-primary/40"}`} />
      <span className={`absolute bottom-3 right-3 w-5 h-5 border-b-[2.5px] border-r-[2.5px] rounded-br transition-colors duration-200 ${over ? "border-primary" : "border-primary/40"}`} />
      <button type="button" onClick={onClick} className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${over ? "bg-primary scale-105 shadow-primary/40" : "bg-primary hover:bg-primary/90 hover:scale-[1.02] shadow-primary/25"}`}>
        <Image className="w-4 h-4" />
        Select Images
      </button>
      <p className={`mt-4 text-xs transition-colors duration-200 ${over ? "text-primary font-medium" : "text-muted-foreground"}`}>{over ? "Release to upload" : "JPG, PNG, WebP · or drop here"}</p>
      {children}
    </div>
  );
}

function FileCard({ name, size, onRemove, testId }: { name: string; size: number; onRemove: () => void; testId?: string }) {
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground truncate max-w-[260px]">{name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} data-testid={testId}><X className="w-4 h-4" /></Button>
    </div>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-muted/50 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" />{label}</span>
        <span className="font-mono text-primary font-semibold">{value}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{msg}</div>;
}

function SuccessBox({ msg }: { msg: string }) {
  return <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-lg">✅ {msg}</div>;
}
