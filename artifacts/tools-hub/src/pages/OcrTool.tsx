import { useState, useRef } from "react";
import { Link } from "wouter";
import { Upload, Copy, Download, X, ScanText, Link2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Status = "idle" | "loading" | "done" | "error";

function triggerDownload(text: string, name: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

let pdfjsCache: typeof import("pdfjs-dist") | null = null;
async function getPdfjs() {
  if (pdfjsCache) return pdfjsCache;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
  pdfjsCache = lib;
  return lib;
}

async function pdfPageToImageData(file: File, pageNum: number, scale = 2): Promise<ImageData> {
  const lib = await getPdfjs();
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  const page = await pdf.getPage(pageNum);
  const vp = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = vp.width; canvas.height = vp.height;
  await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp }).promise;
  return canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
}

async function getPdfPageCount(file: File): Promise<number> {
  const lib = await getPdfjs();
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  return pdf.numPages;
}

export default function OcrTool() {
  useSEO({
    title: "OCR — Extract Text from Image & PDF — ToolsHub",
    description: "Extract text from scanned images, photos, and PDFs using OCR. Browser-only — nothing uploaded.",
  });
  const { count, increment } = useToolCounter("ocr-tool");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isPdf, setIsPdf] = useState(false);
  const [pdfPages, setPdfPages] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [progressPct, setProgressPct] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState("eng");
  const [shareCopied, setShareCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const LANGS = [
    { id: "eng", label: "English" },
    { id: "hin", label: "Hindi (हिन्दी)" },
    { id: "chi_sim", label: "Chinese (Simplified)" },
    { id: "ara", label: "Arabic" },
    { id: "fra", label: "French" },
    { id: "deu", label: "German" },
    { id: "spa", label: "Spanish" },
    { id: "por", label: "Portuguese" },
  ];

  const handleFile = async (f: File) => {
    const isImage = f.type.startsWith("image/");
    const isPdfFile = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isImage && !isPdfFile) return;

    setFile(f);
    setStatus("idle");
    setText("");
    setProgressPct(0);
    setProgressLabel("");
    setIsPdf(isPdfFile);
    setPdfPages(0);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview("");
      try {
        const pages = await getPdfPageCount(f);
        setPdfPages(pages);
      } catch {
        setPdfPages(0);
      }
    }
  };

  const runOCR = async () => {
    if (!file) return;
    setStatus("loading");
    setProgressPct(0);
    setProgressLabel("Loading OCR engine…");
    setText("");

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setProgressPct(Math.round(m.progress * 100));
          }
        },
      });

      if (!isPdf) {
        setProgressLabel("Extracting text…");
        const { data: { text: result } } = await worker.recognize(preview || file);
        await worker.terminate();
        setText(result.trim());
      } else {
        const totalPages = pdfPages || (await getPdfPageCount(file));
        const pageTexts: string[] = [];

        for (let i = 1; i <= totalPages; i++) {
          setProgressLabel(`Processing page ${i} of ${totalPages}…`);
          setProgressPct(0);
          const imageData = await pdfPageToImageData(file, i);
          const { data: { text: pageText } } = await worker.recognize(imageData);
          pageTexts.push(pageText.trim());
        }

        await worker.terminate();
        const combined = pageTexts
          .map((t, i) => totalPages > 1 ? `--- Page ${i + 1} ---\n${t}` : t)
          .join("\n\n");
        setText(combined.trim());
      }

      setStatus("done");
      increment();
    } catch {
      setStatus("error");
    } finally {
      setProgressLabel("");
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const reset = () => {
    setFile(null); setPreview(""); setStatus("idle");
    setText(""); setIsPdf(false); setPdfPages(0);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <ScanText className="w-3.5 h-3.5" />
          <span>OCR Text Extractor</span>
          <UsageCount count={count} label="scan" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">OCR Text Extractor</h1>
        <p className="text-muted-foreground mt-2">
          Extract text from images and PDFs — runs entirely in your browser, nothing uploaded.
        </p>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 text-xs">
          {shareCopied
            ? <><Upload className="w-3.5 h-3.5 text-emerald-500" />Copied!</>
            : <><Link2 className="w-3.5 h-3.5" />Share</>}
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
        {/* Language selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Document language</label>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  lang === l.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload area */}
        {!file ? (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer py-12"
          >
            <ScanText className="w-10 h-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Upload image or PDF to extract text</p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP, BMP, TIFF, <strong>PDF</strong> (multi-page) • Click or drag & drop
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File card */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  {isPdf && pdfPages > 0 && (
                    <p className="text-xs text-muted-foreground">{pdfPages} page{pdfPages !== 1 ? "s" : ""}</p>
                  )}
                </div>
              </div>
              <button
                onClick={reset}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image preview */}
            {preview && (
              <div className="rounded-xl overflow-hidden border border-border bg-muted/20 max-h-64 flex items-center justify-center">
                <img src={preview} alt="Preview" className="max-h-64 object-contain" />
              </div>
            )}

            {/* PDF notice */}
            {isPdf && !preview && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary">
                Each page will be rendered and scanned separately. Large PDFs may take a few minutes.
              </div>
            )}

            {/* Progress */}
            {status === "loading" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{progressLabel || "Extracting text…"}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground/70 text-center">
                  OCR runs locally in your browser — this may take 10–60 seconds
                </p>
              </div>
            )}

            {status === "error" && (
              <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2">
                Failed to extract text. Try a clearer image or a text-based PDF.
              </p>
            )}

            {status === "done" && text && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Extracted text ({text.split(/\s+/).filter(Boolean).length} words)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={copyText}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => triggerDownload(text, file.name.replace(/\.[^.]+$/, ".txt"))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />Download .txt
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={text}
                  rows={10}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            {status === "done" && !text && (
              <p className="text-sm text-amber-600 bg-amber-500/10 rounded-lg px-4 py-2">
                No text found. Try a higher-resolution image or a scanned PDF.
              </p>
            )}

            {status !== "loading" && (
              <Button onClick={runOCR} className="w-full">
                <ScanText className="w-4 h-4 mr-2" />
                {status === "done" ? "Run OCR Again" : "Extract Text"}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
        <p className="text-xs font-semibold text-foreground">How it works</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Upload a photo, screenshot, scanned document, or PDF</li>
          <li>PDFs are rendered page-by-page and scanned with OCR</li>
          <li>Tesseract OCR engine runs locally in your browser</li>
          <li>Text is extracted — copy or download as .txt</li>
          <li>Nothing is sent to any server — 100% private</li>
        </ul>
      </div>
    </div>
  );
}
