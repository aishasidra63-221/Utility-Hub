import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { FileText, Upload, Download, X, RefreshCw, Image, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Mode = "pdf-to-images" | "images-to-pdf";

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

  const renderPage = async (pageNum: number): Promise<string> => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    if (onProgress) onProgress(Math.round((pageNum / total) * 100));
    return dataUrl;
  };

  const BATCH = 3;
  const results: string[] = new Array(total);
  for (let i = 0; i < total; i += BATCH) {
    const batch = Array.from({ length: Math.min(BATCH, total - i) }, (_, j) => renderPage(i + j + 1));
    const batchResults = await Promise.all(batch);
    batchResults.forEach((r, j) => { results[i + j] = r; });
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

export default function PdfConverter() {
  useSEO({
    title: "Free PDF to Image Converter & Images to PDF Online | ToolsHub",
    description:
      "Convert PDF pages to PNG images, or combine multiple images into a single PDF. Free, browser-based, no file upload to servers.",
  });

  const { count, increment } = useToolCounter("pdf-converter");
  const [mode, setMode] = useState<Mode>("pdf-to-images");
  const [shareCopied, setShareCopied] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfError, setPdfError] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [imgFiles, setImgFiles] = useState<File[]>([]);
  const [imgPreviews, setImgPreviews] = useState<string[]>([]);
  const [pdfBuilding, setPdfBuilding] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handlePdfFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setPdfFile(f);
    setPdfImages([]);
    setPdfError("");
  };

  const convertPdfToImages = async () => {
    if (!pdfFile) return;
    setPdfLoading(true);
    setPdfProgress(0);
    setPdfError("");
    try {
      const images = await pdfToImages(pdfFile, setPdfProgress);
      setPdfImages(images);
      increment();
    } catch (e) {
      setPdfError("Failed to convert PDF. Make sure it is a valid PDF file.");
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadPdfPage = (dataUrl: string, pageNum: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `page-${pageNum}.jpg`;
    a.click();
  };

  const downloadAllPages = () => {
    pdfImages.forEach((src, i) => downloadPdfPage(src, i + 1));
  };

  const handleImgFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setImgFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImgPreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
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
    try {
      await imagesToPdf(imgPreviews);
      increment();
    } catch (e) {
      console.error(e);
    } finally {
      setPdfBuilding(false);
    }
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
              Convert PDF pages to images, or combine images into a PDF. All processing happens in your browser.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLink}
            data-testid="button-share-link"
            className="gap-2 text-xs"
          >
            {shareCopied ? (
              <>
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                Link copied!
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                Share this tool
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex rounded-xl border border-border bg-muted/30 p-1 mb-8 w-fit gap-1">
        {(["pdf-to-images", "images-to-pdf"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            data-testid={`tab-${m}`}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "pdf-to-images" ? "PDF to Images" : "Images to PDF"}
          </button>
        ))}
      </div>

      {mode === "pdf-to-images" && (
        <div className="space-y-6">
          {!pdfFile ? (
            <div
              onClick={() => pdfInputRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handlePdfFile(f); }}
              onDragOver={(e) => e.preventDefault()}
              data-testid="dropzone-pdf"
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Click or drag to upload a PDF</p>
              <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                data-testid="input-pdf-file"
                onChange={(e) => e.target.files?.[0] && handlePdfFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{pdfFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(pdfFile.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setPdfFile(null); setPdfImages([]); setPdfError(""); }}
                  data-testid="button-remove-pdf"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {pdfError && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                  {pdfError}
                </div>
              )}

              {pdfLoading && (
                <div className="bg-muted/50 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Converting pages...
                    </span>
                    <span className="font-mono text-primary font-semibold">{pdfProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${pdfProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={convertPdfToImages} disabled={pdfLoading} data-testid="button-convert-pdf">
                  {pdfLoading ? "Converting..." : "Convert to Images"}
                </Button>
                {pdfImages.length > 0 && (
                  <Button variant="outline" onClick={downloadAllPages}>
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                )}
              </div>

              {pdfImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    {pdfImages.length} page{pdfImages.length > 1 ? "s" : ""} extracted
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {pdfImages.map((src, i) => (
                      <div key={i} className="group relative rounded-lg border border-border overflow-hidden">
                        <img
                          src={src}
                          alt={`Page ${i + 1}`}
                          className="w-full object-cover"
                          loading="lazy"
                          data-testid={`img-pdf-page-${i + 1}`}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadPdfPage(src, i + 1)}
                            data-testid={`button-download-page-${i + 1}`}
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            Page {i + 1}
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                          Page {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {mode === "images-to-pdf" && (
        <div className="space-y-6">
          <div
            onClick={() => imgInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); handleImgFiles(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            data-testid="dropzone-images"
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">Drop images here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — multiple files allowed</p>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              data-testid="input-images-for-pdf"
              onChange={(e) => e.target.files && handleImgFiles(e.target.files)}
            />
          </div>

          {imgPreviews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {imgPreviews.length} image{imgPreviews.length > 1 ? "s" : ""} selected
                </p>
                <Button variant="ghost" size="sm" onClick={() => { setImgFiles([]); setImgPreviews([]); }}>
                  Clear all
                </Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {imgPreviews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg border border-border overflow-hidden aspect-square">
                    <img src={src} alt={imgFiles[i]?.name} className="w-full h-full object-cover" loading="lazy" />
                    <button
                      onClick={() => removeImg(i)}
                      data-testid={`button-remove-img-${i}`}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={buildPdf} disabled={pdfBuilding} data-testid="button-build-pdf">
                {pdfBuilding ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Building PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
