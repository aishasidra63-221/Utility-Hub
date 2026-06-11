import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { FileText, Upload, Download, X, RefreshCw, Image, Link2, Scissors, Layers, Archive, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Mode = "pdf-to-images" | "images-to-pdf" | "split-pdf" | "merge-pdfs" | "pdf-to-zip" | "docx-to-pdf";

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

async function pdfToImages(file: File, onProgress?: (p: number) => void): Promise<string[]> {
  const pdfjsLib = await getPdfjsLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  const BATCH = 3;
  const results: string[] = new Array(total);
  for (let i = 0; i < total; i += BATCH) {
    const batch = Array.from({ length: Math.min(BATCH, total - i) }, async (_, j) => {
      const page = await pdf.getPage(i + j + 1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
      results[i + j] = canvas.toDataURL("image/jpeg", 0.92);
      if (onProgress) onProgress(Math.round(((i + j + 1) / total) * 100));
    });
    await Promise.all(batch);
  }
  return results;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function imagesToPdf(dataUrls: string[]): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "px" });
  let firstPage = true;
  for (const dataUrl of dataUrls) {
    const img = await loadImage(dataUrl);
    const w = img.naturalWidth || 800;
    const h = img.naturalHeight || 600;
    const pdfW = 595;
    const pdfH = Math.round(h * (pdfW / w));
    if (firstPage) {
      pdf.internal.pageSize.width = pdfW;
      pdf.internal.pageSize.height = pdfH;
      firstPage = false;
    } else {
      pdf.addPage([pdfW, pdfH], pdfH > pdfW ? "portrait" : "landscape");
    }
    pdf.addImage(dataUrl, "JPEG", 0, 0, pdfW, pdfH);
  }
  pdf.save("converted.pdf");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const TABS: { id: Mode; label: string; icon: React.ReactNode; short: string }[] = [
  { id: "pdf-to-images", label: "PDF → Images", icon: <Image className="w-3.5 h-3.5" />, short: "PDF to Images" },
  { id: "images-to-pdf", label: "Images → PDF", icon: <FileText className="w-3.5 h-3.5" />, short: "Images to PDF" },
  { id: "split-pdf", label: "Split PDF", icon: <Scissors className="w-3.5 h-3.5" />, short: "Split" },
  { id: "merge-pdfs", label: "Merge PDFs", icon: <Layers className="w-3.5 h-3.5" />, short: "Merge" },
  { id: "pdf-to-zip", label: "PDF → ZIP", icon: <Archive className="w-3.5 h-3.5" />, short: "ZIP" },
  { id: "docx-to-pdf", label: "DOCX → PDF", icon: <FileType className="w-3.5 h-3.5" />, short: "DOCX" },
];

export default function PdfConverter() {
  useSEO({
    title: "Free PDF Tools — Convert, Split, Merge, ZIP Online | ToolsHub",
    description:
      "Convert, split, merge, and ZIP PDFs in your browser. Also convert DOCX to PDF and images to PDF. Free, no upload to server.",
  });

  const { count, increment } = useToolCounter("pdf-converter");
  const [mode, setMode] = useState<Mode>("pdf-to-images");
  const [shareCopied, setShareCopied] = useState(false);

  // PDF → Images
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfError, setPdfError] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Images → PDF
  const [imgFiles, setImgFiles] = useState<File[]>([]);
  const [imgPreviews, setImgPreviews] = useState<string[]>([]);
  const [pdfBuilding, setPdfBuilding] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  // Split PDF
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitLoading, setSplitLoading] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);
  const [splitError, setSplitError] = useState("");
  const [splitDone, setSplitDone] = useState(false);
  const splitInputRef = useRef<HTMLInputElement>(null);

  // Merge PDFs
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeError, setMergeError] = useState("");
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // PDF → ZIP
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipError, setZipError] = useState("");
  const zipInputRef = useRef<HTMLInputElement>(null);

  // DOCX → PDF
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [docxLoading, setDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState("");
  const docxInputRef = useRef<HTMLInputElement>(null);

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  // ── PDF → Images ──────────────────────────────────────────
  const handlePdfFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setPdfFile(f); setPdfImages([]); setPdfError("");
  };

  const convertPdfToImages = async () => {
    if (!pdfFile) return;
    setPdfLoading(true); setPdfProgress(0); setPdfError("");
    try {
      const images = await pdfToImages(pdfFile, setPdfProgress);
      setPdfImages(images);
      increment();
    } catch (e) {
      setPdfError("Failed to convert PDF. Make sure it is a valid PDF file.");
    } finally { setPdfLoading(false); }
  };

  const downloadPdfPage = (dataUrl: string, pageNum: number) => {
    const a = document.createElement("a");
    a.href = dataUrl; a.download = `page-${pageNum}.jpg`; a.click();
  };
  const downloadAllPages = () => pdfImages.forEach((src, i) => downloadPdfPage(src, i + 1));

  // ── Images → PDF ──────────────────────────────────────────
  const handleImgFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setImgFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => { if (e.target?.result) setImgPreviews((prev) => [...prev, e.target!.result as string]); };
      reader.readAsDataURL(f);
    });
  };
  const removeImg = (idx: number) => {
    setImgFiles((prev) => prev.filter((_, i) => i !== idx));
    setImgPreviews((prev) => prev.filter((_, i) => i !== idx));
  };
  const buildPdf = async () => {
    if (!imgPreviews.length) return;
    setPdfBuilding(true);
    try { await imagesToPdf(imgPreviews); increment(); }
    catch (e) { console.error(e); }
    finally { setPdfBuilding(false); }
  };

  // ── Split PDF ─────────────────────────────────────────────
  const handleSplitFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setSplitFile(f); setSplitError(""); setSplitDone(false);
  };

  const splitPdf = async () => {
    if (!splitFile) return;
    setSplitLoading(true); setSplitProgress(0); setSplitError(""); setSplitDone(false);
    try {
      const bytes = await splitFile.arrayBuffer();
      const srcPdf = await PDFDocument.load(bytes);
      const total = srcPdf.getPageCount();
      const zip = new JSZip();
      for (let i = 0; i < total; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(srcPdf, [i]);
        newPdf.addPage(page);
        const pageBytes = await newPdf.save();
        zip.file(`page-${i + 1}.pdf`, pageBytes);
        setSplitProgress(Math.round(((i + 1) / total) * 100));
      }
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, `${splitFile.name.replace(".pdf", "")}-split.zip`);
      setSplitDone(true);
      increment();
    } catch (e) {
      setSplitError("Failed to split PDF. Make sure it is a valid PDF.");
      console.error(e);
    } finally { setSplitLoading(false); }
  };

  // ── Merge PDFs ────────────────────────────────────────────
  const handleMergeFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    setMergeFiles((prev) => [...prev, ...arr]);
    setMergeError("");
  };
  const removeMergeFile = (idx: number) => setMergeFiles((prev) => prev.filter((_, i) => i !== idx));

  const mergePdfs = async () => {
    if (mergeFiles.length < 2) { setMergeError("Please add at least 2 PDF files."); return; }
    setMergeLoading(true); setMergeError("");
    try {
      const merged = await PDFDocument.create();
      for (const file of mergeFiles) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const mergedBytes = await merged.save();
      triggerDownload(new Blob([mergedBytes], { type: "application/pdf" }), "merged.pdf");
      increment();
    } catch (e) {
      setMergeError("Failed to merge PDFs. Make sure all files are valid PDFs.");
      console.error(e);
    } finally { setMergeLoading(false); }
  };

  // ── PDF → ZIP ─────────────────────────────────────────────
  const handleZipFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setZipFile(f); setZipError("");
  };

  const pdfToZip = async () => {
    if (!zipFile) return;
    setZipLoading(true); setZipProgress(0); setZipError("");
    try {
      const images = await pdfToImages(zipFile, setZipProgress);
      const zip = new JSZip();
      const baseName = zipFile.name.replace(".pdf", "");
      images.forEach((dataUrl, i) => {
        const base64 = dataUrl.split(",")[1];
        zip.file(`${baseName}-page-${i + 1}.jpg`, base64, { base64: true });
      });
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, `${baseName}-pages.zip`);
      increment();
    } catch (e) {
      setZipError("Failed to process PDF.");
      console.error(e);
    } finally { setZipLoading(false); }
  };

  // ── DOCX → PDF ────────────────────────────────────────────
  const handleDocxFile = (f: File) => {
    if (!f.name.toLowerCase().match(/\.(docx|doc)$/)) return;
    setDocxFile(f); setDocxError("");
  };

  const convertDocxToPdf = async () => {
    if (!docxFile) return;
    setDocxLoading(true); setDocxError("");
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await docxFile.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:210mm;height:297mm;";
      document.body.appendChild(iframe);
      const iDoc = iframe.contentDocument!;
      iDoc.open();
      iDoc.write(`<!DOCTYPE html><html><head><style>
        body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; margin: 20mm; color: #000; }
        h1,h2,h3 { margin: 0.5em 0; } p { margin: 0.3em 0; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ccc; padding: 4px 8px; }
        img { max-width: 100%; }
      </style></head><body>${html}</body></html>`);
      iDoc.close();

      await new Promise((r) => setTimeout(r, 800));

      const iWindow = iframe.contentWindow!;
      iWindow.focus();
      iWindow.print();
      document.body.removeChild(iframe);

      increment();
    } catch (e) {
      setDocxError("Failed to convert. Make sure it is a valid .docx file.");
      console.error(e);
    } finally { setDocxLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Tools</span>
              <UsageCount count={count} label="conversion" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">PDF Converter</h1>
            <p className="text-muted-foreground mt-2">
              Convert, split, merge, ZIP and more — everything runs in your browser.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleShareLink} data-testid="button-share-link" className="gap-2 text-xs">
            {shareCopied ? <><Upload className="w-3.5 h-3.5 text-emerald-500" />Link copied!</> : <><Link2 className="w-3.5 h-3.5" />Share</>}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-8 bg-muted/30 border border-border rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            data-testid={`tab-${tab.id}`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex-1 justify-center sm:flex-none ${
              mode === tab.id
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
          </button>
        ))}
      </div>

      {/* ── PDF → Images ── */}
      {mode === "pdf-to-images" && (
        <div className="space-y-6">
          {!pdfFile ? (
            <DropZone
              icon={<FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />}
              label="Click or drag to upload a PDF"
              sub="PDF files only"
              onClick={() => pdfInputRef.current?.click()}
              onDrop={(f) => handlePdfFile(f)}
              testId="dropzone-pdf"
            >
              <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" data-testid="input-pdf-file" onChange={(e) => e.target.files?.[0] && handlePdfFile(e.target.files[0])} />
            </DropZone>
          ) : (
            <div className="space-y-4">
              <FileCard name={pdfFile.name} size={pdfFile.size} onRemove={() => { setPdfFile(null); setPdfImages([]); }} testId="button-remove-pdf" />
              {pdfError && <ErrorBox msg={pdfError} />}
              {pdfLoading && <ProgressBar value={pdfProgress} label="Converting pages..." />}
              <div className="flex gap-3 flex-wrap">
                <Button onClick={convertPdfToImages} disabled={pdfLoading} data-testid="button-convert-pdf">
                  {pdfLoading ? "Converting..." : "Convert to Images"}
                </Button>
                {pdfImages.length > 0 && <Button variant="outline" onClick={downloadAllPages}><Download className="w-4 h-4 mr-2" />Download All</Button>}
              </div>
              {pdfImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">{pdfImages.length} page{pdfImages.length > 1 ? "s" : ""} extracted</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {pdfImages.map((src, i) => (
                      <div key={i} className="group relative rounded-lg border border-border overflow-hidden">
                        <img src={src} alt={`Page ${i + 1}`} className="w-full object-cover" loading="lazy" data-testid={`img-pdf-page-${i + 1}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="secondary" onClick={() => downloadPdfPage(src, i + 1)} data-testid={`button-download-page-${i + 1}`}>
                            <Download className="w-3.5 h-3.5 mr-1" />Page {i + 1}
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">Page {i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Images → PDF ── */}
      {mode === "images-to-pdf" && (
        <div className="space-y-6">
          <DropZone icon={<Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />} label="Drop images here or click to upload" sub="JPG, PNG, WebP — multiple files allowed" onClick={() => imgInputRef.current?.click()} onDrop={(f) => handleImgFiles([f])} testId="dropzone-images">
            <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" data-testid="input-images-for-pdf" onChange={(e) => e.target.files && handleImgFiles(e.target.files)} />
          </DropZone>
          {imgPreviews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{imgPreviews.length} image{imgPreviews.length > 1 ? "s" : ""} selected</p>
                <Button variant="ghost" size="sm" onClick={() => { setImgFiles([]); setImgPreviews([]); }}>Clear all</Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {imgPreviews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg border border-border overflow-hidden aspect-square">
                    <img src={src} alt={imgFiles[i]?.name} className="w-full h-full object-cover" loading="lazy" />
                    <button onClick={() => removeImg(i)} data-testid={`button-remove-img-${i}`} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-white"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <Button onClick={buildPdf} disabled={pdfBuilding} data-testid="button-build-pdf">
                {pdfBuilding ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Building PDF...</> : <><Download className="w-4 h-4 mr-2" />Download PDF</>}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Split PDF ── */}
      {mode === "split-pdf" && (
        <div className="space-y-6">
          <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
            <Scissors className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
            <span>Splits every page of your PDF into a separate PDF file, then downloads them all as a single ZIP.</span>
          </div>
          {!splitFile ? (
            <DropZone icon={<Scissors className="w-10 h-10 mx-auto text-muted-foreground mb-3" />} label="Upload PDF to split" sub="PDF files only" onClick={() => splitInputRef.current?.click()} onDrop={(f) => handleSplitFile(f)} testId="dropzone-split">
              <input ref={splitInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleSplitFile(e.target.files[0])} />
            </DropZone>
          ) : (
            <div className="space-y-4">
              <FileCard name={splitFile.name} size={splitFile.size} onRemove={() => { setSplitFile(null); setSplitDone(false); }} />
              {splitError && <ErrorBox msg={splitError} />}
              {splitLoading && <ProgressBar value={splitProgress} label="Splitting pages..." />}
              {splitDone && <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">✅ ZIP downloaded successfully!</div>}
              <Button onClick={splitPdf} disabled={splitLoading}>
                {splitLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Splitting... {splitProgress}%</> : <><Scissors className="w-4 h-4 mr-2" />Split & Download ZIP</>}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Merge PDFs ── */}
      {mode === "merge-pdfs" && (
        <div className="space-y-6">
          <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
            <Layers className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
            <span>Combine multiple PDF files into one. Pages are added in the order you upload them.</span>
          </div>
          <DropZone icon={<Layers className="w-8 h-8 mx-auto text-muted-foreground mb-2" />} label="Drop PDF files here or click to upload" sub="Multiple PDFs allowed · Merged in order" onClick={() => mergeInputRef.current?.click()} onDrop={(f) => handleMergeFiles([f])} testId="dropzone-merge">
            <input ref={mergeInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => e.target.files && handleMergeFiles(e.target.files)} />
          </DropZone>
          {mergeFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{mergeFiles.length} PDF{mergeFiles.length > 1 ? "s" : ""} added</p>
                <Button variant="ghost" size="sm" onClick={() => setMergeFiles([])}>Clear all</Button>
              </div>
              <div className="space-y-2">
                {mergeFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2">
                    <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                    <button onClick={() => removeMergeFile(i)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              {mergeError && <ErrorBox msg={mergeError} />}
              <Button onClick={mergePdfs} disabled={mergeLoading}>
                {mergeLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Merging...</> : <><Download className="w-4 h-4 mr-2" />Merge & Download</>}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── PDF → ZIP ── */}
      {mode === "pdf-to-zip" && (
        <div className="space-y-6">
          <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
            <Archive className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
            <span>Converts every PDF page to a JPG image, then packages all images into a single ZIP file.</span>
          </div>
          {!zipFile ? (
            <DropZone icon={<Archive className="w-10 h-10 mx-auto text-muted-foreground mb-3" />} label="Upload PDF to ZIP" sub="PDF files only" onClick={() => zipInputRef.current?.click()} onDrop={(f) => handleZipFile(f)} testId="dropzone-zip">
              <input ref={zipInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleZipFile(e.target.files[0])} />
            </DropZone>
          ) : (
            <div className="space-y-4">
              <FileCard name={zipFile.name} size={zipFile.size} onRemove={() => setZipFile(null)} />
              {zipError && <ErrorBox msg={zipError} />}
              {zipLoading && <ProgressBar value={zipProgress} label="Converting pages to images..." />}
              <Button onClick={pdfToZip} disabled={zipLoading}>
                {zipLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Processing... {zipProgress}%</> : <><Archive className="w-4 h-4 mr-2" />Convert & Download ZIP</>}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── DOCX → PDF ── */}
      {mode === "docx-to-pdf" && (
        <div className="space-y-6">
          <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
            <FileType className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
            <span>Converts your Word document (.docx) to PDF using your browser's print dialog. Select "Save as PDF" in the print dialog to save the file.</span>
          </div>
          {!docxFile ? (
            <DropZone icon={<FileType className="w-10 h-10 mx-auto text-muted-foreground mb-3" />} label="Upload Word document" sub=".doc or .docx files" onClick={() => docxInputRef.current?.click()} onDrop={(f) => handleDocxFile(f)} testId="dropzone-docx">
              <input ref={docxInputRef} type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(e) => e.target.files?.[0] && handleDocxFile(e.target.files[0])} />
            </DropZone>
          ) : (
            <div className="space-y-4">
              <FileCard name={docxFile.name} size={docxFile.size} onRemove={() => setDocxFile(null)} />
              {docxError && <ErrorBox msg={docxError} />}
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs px-4 py-3 rounded-lg">
                💡 <strong>Tip:</strong> When the print dialog opens, choose <strong>"Save as PDF"</strong> or <strong>"Microsoft Print to PDF"</strong> as the printer.
              </div>
              <Button onClick={convertDocxToPdf} disabled={docxLoading}>
                {docxLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Converting...</> : <><FileType className="w-4 h-4 mr-2" />Convert to PDF</>}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DropZone({ icon, label, sub, onClick, onDrop, testId, children }: {
  icon: React.ReactNode; label: string; sub: string;
  onClick: () => void; onDrop: (f: File) => void; testId: string; children?: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onClick={onClick}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onDrop(f); }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      data-testid={testId}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${over ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
    >
      {icon}
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
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
          <p className="text-sm font-medium text-foreground">{name}</p>
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
