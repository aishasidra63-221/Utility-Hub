import { useState, useRef, useCallback } from "react";
import { Download, Eraser, X, Loader2, RefreshCw } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

export default function BackgroundRemover() {
  useSEO({
    title: "Free Background Remover — Remove Image Background Instantly | ToolsHub",
    description:
      "Remove image backgrounds instantly in your browser. AI-powered, 100% private — no server upload, no API key needed.",
  });

  const { count, increment } = useToolCounter("bg-remover");

  const [original, setOriginal] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported (JPG, PNG, WebP).");
      return;
    }
    setError("");
    setResult(null);
    setOriginalFile(file);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_no_bg.png");
    setOriginal(URL.createObjectURL(file));
    setLoading(true);
    setProgress("Initializing AI…");
    try {
      // Configure ONNX Runtime to use single-threaded WASM (no crossOriginIsolated needed)
      const ort = await import("onnxruntime-web");
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/";

      const { removeBackground } = await import("@imgly/background-removal");
      setProgress("Downloading AI model (~25MB)…");
      const blob = await removeBackground(file, {
        publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/",
        model: "small",
        output: { quality: 0.9, format: "image/png" },
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            if (key.includes("fetch") || key.includes("model")) {
              setProgress(`Downloading AI model: ${pct}%`);
            } else {
              setProgress(`Processing image: ${pct}%`);
            }
          }
        },
      });
      setResult(URL.createObjectURL(blob));
      increment();
    } catch (e: any) {
      console.error("Background removal error:", e);
      setError(
        "Could not remove background. " +
        (e?.message ? `(${e.message.slice(0, 120)})` : "Please try a different image.")
      );
    } finally {
      setLoading(false);
      setProgress("");
    }
  }, [increment]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (file) processFile(file);
  }, [processFile]);

  const reset = () => {
    setOriginal(null);
    setOriginalFile(null);
    setResult(null);
    setError("");
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = fileName || "background_removed.png";
    a.click();
  };

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <Eraser className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="background removed" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Background Remover</h1>
            <p className="text-muted-foreground mt-2">
              Upload an image and the background is removed instantly. AI runs entirely in your browser — nothing is uploaded.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      {/* First use notice */}
      <div className="mb-5 flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <span>
          <strong>First use:</strong> The AI model (~25MB) downloads once to your browser. After that it runs instantly offline.
        </span>
      </div>

      {!original ? (
        <ImageDropZone
          dragOver={dragOver}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          title="Drop an image to remove its background"
          subtitle="Works best with clear subjects on solid backgrounds"
          badges={["JPG", "PNG", "WebP"]}
          buttonLabel="Select Image"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </ImageDropZone>
      ) : (
        <div className="space-y-5">
          {/* Before / After */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original</p>
              </div>
              <div className="p-3 bg-muted/20 flex items-center justify-center min-h-[200px]">
                <img src={original} alt="original"
                  className="max-h-[260px] max-w-full rounded-lg object-contain" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Background Removed</p>
                {result && !loading && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Done</span>
                )}
              </div>
              <div
                className="p-3 flex items-center justify-center min-h-[200px]"
                style={{ backgroundImage: "repeating-conic-gradient(#d0d0d8 0% 25%, white 0% 50%)", backgroundSize: "18px 18px" }}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-3 text-center px-4">
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">{progress}</p>
                  </div>
                ) : result ? (
                  <img src={result} alt="result"
                    className="max-h-[260px] max-w-full rounded-lg object-contain" />
                ) : (
                  <p className="text-sm text-muted-foreground">Processing…</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {result && !loading && (
              <Button onClick={download} className="gap-2">
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
            )}
            {loading && originalFile && (
              <Button disabled className="gap-2 opacity-60">
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress || "Processing…"}
              </Button>
            )}
            <Button variant="outline" onClick={() => { reset(); }} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              New Image
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>

          {result && !loading && (
            <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> The result is a transparent PNG. You can place it on any background — in Canva, PowerPoint, or any design tool.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
