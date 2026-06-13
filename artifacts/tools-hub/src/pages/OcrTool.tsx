import { useState, useRef } from "react";
import { Link } from "wouter";
import { Upload, Copy, Download, X, RefreshCw, ScanText, Link2, FileText } from "lucide-react";
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

export default function OcrTool() {
  useSEO({ title: "OCR — Extract Text from Image — ToolsHub", description: "Extract text from scanned images, photos, and PDFs using OCR. Browser-only — nothing uploaded." });
  const { count, increment } = useToolCounter("ocr-tool");

  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [status, setStatus]   = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [text, setText]       = useState("");
  const [copied, setCopied]   = useState(false);
  const [lang, setLang]       = useState("eng");
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

  const handleFile = (f: File) => {
    const ok = f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".pdf");
    if (!ok) return;
    setFile(f); setStatus("idle"); setText(""); setProgress(0);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview("");
    }
  };

  const runOCR = async () => {
    if (!file) return;
    setStatus("loading"); setProgress(0); setText("");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });

      let imageData: string | File = file;
      if (file.type.startsWith("image/")) {
        imageData = preview || file;
      }

      const { data: { text: result } } = await worker.recognize(imageData);
      await worker.terminate();
      setText(result.trim());
      setStatus("done");
      increment();
    } catch {
      setStatus("error");
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
        <p className="text-muted-foreground mt-2">Extract text from scanned images or photos — runs entirely in your browser, nothing uploaded to any server.</p>
      </div>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 text-xs">
          {shareCopied ? <><Upload className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Link2 className="w-3.5 h-3.5" />Share</>}
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
        {/* Language selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Document language</label>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button key={l.id} onClick={() => setLang(l.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${lang === l.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
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
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer py-12"
          >
            <ScanText className="w-10 h-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Upload image to extract text</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, BMP, TIFF • Click or drag & drop</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File card */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm font-medium truncate">{file.name}</p>
              </div>
              <button onClick={() => { setFile(null); setPreview(""); setStatus("idle"); setText(""); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image preview */}
            {preview && (
              <div className="rounded-xl overflow-hidden border border-border bg-muted/20 max-h-64 flex items-center justify-center">
                <img src={preview} alt="Preview" className="max-h-64 object-contain" />
              </div>
            )}

            {/* Progress */}
            {status === "loading" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Extracting text...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground/70 text-center">OCR is running locally in your browser — this may take 10-30 seconds</p>
              </div>
            )}

            {status === "error" && (
              <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2">Failed to extract text. Please try a clearer image.</p>
            )}

            {status === "done" && text && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Extracted text ({text.split(/\s+/).filter(Boolean).length} words)</label>
                  <div className="flex gap-2">
                    <button onClick={copyText} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors">
                      <Copy className="w-3.5 h-3.5" />{copied ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={() => triggerDownload(text, file.name.replace(/\.[^.]+$/, ".txt"))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors">
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
              <p className="text-sm text-amber-600 bg-amber-500/10 rounded-lg px-4 py-2">No text found. Try a higher-resolution or higher-contrast image.</p>
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
          <li>Upload a photo, screenshot, or scanned document</li>
          <li>Tesseract OCR engine runs locally in your browser</li>
          <li>Text is extracted and shown — copy or download as .txt</li>
          <li>Nothing is sent to any server — 100% private</li>
        </ul>
      </div>
    </div>
  );
}
