import { useState, useRef, useCallback, useEffect } from "react";
import { Download, Eraser, RefreshCw, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type ModelStatus = "idle" | "preloading" | "ready" | "error";

export default function BackgroundRemover() {
  useSEO({
    title: "Free Background Remover — Remove Image Background Instantly | ToolsHub",
    description:
      "Remove image backgrounds instantly in your browser. AI-powered, 100% private — no server upload, no API key needed.",
  });

  const { count, increment } = useToolCounter("bg-remover");

  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");

  const inputRef = useRef<HTMLInputElement>(null);
  const modelReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function preloadModel() {
      setModelStatus("preloading");
      try {
        const { preload } = await import("@imgly/background-removal");
        if (cancelled) return;
        await preload({
          debug: false,
          model: "isnet",
          publicPath: "https://unpkg.com/@imgly/background-removal@1.7.0/dist/",
        });
        if (!cancelled) {
          modelReadyRef.current = true;
          setModelStatus("ready");
        }
      } catch {
        if (!cancelled) setModelStatus("error");
      }
    }
    preloadModel();
    return () => { cancelled = true; };
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Sirf image files support hain (JPG, PNG, WebP).");
      return;
    }
    setError("");
    setResult(null);
    setProgressPct(0);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_no_bg.png");

    const originalUrl = URL.createObjectURL(file);
    setOriginal(originalUrl);
    setProcessing(true);
    setProgressLabel(modelReadyRef.current ? "Background remove ho raha hai…" : "AI model load ho raha hai…");
    setProgressPct(modelReadyRef.current ? 10 : 0);

    try {
      const { removeBackground } = await import("@imgly/background-removal");

      const resultBlob = await removeBackground(file, {
        debug: false,
        model: "isnet",
        publicPath: "https://unpkg.com/@imgly/background-removal@1.7.0/dist/",
        output: { format: "image/png", quality: 1 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            if (pct < 100) {
              setProgressPct(pct);
              setProgressLabel(`AI model download: ${pct}%`);
            } else {
              setProgressPct(95);
              setProgressLabel("Background remove ho raha hai…");
            }
          }
        },
      });

      setProgressPct(100);
      setProgressLabel("Ho gaya!");
      setResult(URL.createObjectURL(resultBlob));
      modelReadyRef.current = true;
      increment();
    } catch (e: unknown) {
      console.error("Background removal error:", e);
      const msg = e instanceof Error ? e.message : "";
      setError(
        "Background remove nahi ho saka. " +
          (msg ? `(${msg.slice(0, 180)})` : "Koi aur image try karo.")
      );
    } finally {
      setProcessing(false);
    }
  }, [increment]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const file = Array.from(files)[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const reset = () => {
    setOriginal(null);
    setResult(null);
    setError("");
    setProgressPct(0);
    setProgressLabel("");
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = fileName || "background_removed.png";
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-5 pb-10">
      {/* Header */}
      <div className="mb-5 flex flex-col items-center text-center gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eraser className="w-3.5 h-3.5" />
          <span>Image Tools</span>
          <UsageCount count={count} label="backgrounds removed" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Background Remover
        </h1>
        <p className="text-muted-foreground">
          Image upload karo — background instantly remove ho jaayega. Sab kuch
          browser mein hota hai, koi upload nahi.
        </p>

        {/* Model status badge */}
        {modelStatus === "preloading" && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            AI model background mein download ho raha hai…
          </div>
        )}
        {modelStatus === "ready" && (
          <div className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full px-3 py-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AI model ready — instant processing!
          </div>
        )}
      </div>

      {/* Upload Zone — always visible at top */}
      <div className="mb-5">
        <ImageDropZone
          dragOver={dragOver}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          title={original ? "Naya image choose karo" : "Drop an image to remove its background"}
          subtitle="Works best with clear subjects"
          badges={["JPG", "PNG", "WebP"]}
          buttonLabel={original ? "Change Image" : "Select Image"}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </ImageDropZone>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Progress Bar — shown during processing */}
      {processing && (
        <div className="mb-5 bg-card border border-border rounded-xl px-5 py-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              {progressLabel || "Processing…"}
            </span>
            <span className="font-bold text-primary tabular-nums">{progressPct}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Pehli baar ~20 MB model download hota hai, baad mein instantly kaam karta hai.
          </p>
        </div>
      )}

      {/* Before / After + Download — shown after processing */}
      {original && !processing && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original</p>
              </div>
              <div className="p-3 bg-muted/20 flex items-center justify-center min-h-[200px]">
                <img
                  src={original}
                  alt="original"
                  className="max-h-[260px] max-w-full rounded-lg object-contain"
                />
              </div>
            </div>

            {/* Result */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Background Removed
                </p>
                {result && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  </span>
                )}
              </div>
              <div
                className="p-3 flex items-center justify-center min-h-[200px]"
                style={{
                  backgroundImage: "repeating-conic-gradient(#c8c8d0 0% 25%, #ffffff 0% 50%)",
                  backgroundSize: "18px 18px",
                }}
              >
                {result ? (
                  <img
                    src={result}
                    alt="result"
                    className="max-h-[260px] max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Koi result nahi</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {result && (
              <Button onClick={download} size="lg" className="gap-2 flex-1 sm:flex-none">
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
            )}
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Naya Image
            </Button>
          </div>

          {result && (
            <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>
                Result ek transparent PNG hai. Canva, PowerPoint ya kisi bhi design tool mein use karo.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
