import { useState, useRef, useCallback } from "react";
import { Download, Eraser, Loader2, RefreshCw } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
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
  const [result,   setResult]   = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState("");
  const [error,    setError]    = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported (JPG, PNG, WebP).");
      return;
    }
    setError("");
    setResult(null);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_no_bg.png");

    const originalUrl = URL.createObjectURL(file);
    setOriginal(originalUrl);
    setLoading(true);
    setProgress("Initializing…");

    try {
      // @imgly/background-removal is a dedicated library for this task.
      // It manages its own WASM/model loading and falls back gracefully.
      const { removeBackground } = await import("@imgly/background-removal");

      // ort 1.17.3 expects wasmPaths keyed by filename (e.g. "ort-wasm-simd-threaded.wasm"),
      // but the imgly library (built for ort 1.21-dev) sets { mjs, wasm }.
      // Intercept the setter and remap to the format ort 1.17.3 actually reads.
      const ort = await import("onnxruntime-web");
      const wasmEnv = ort.env.wasm as Record<string, unknown>;
      let _wasmPathsValue: unknown = wasmEnv.wasmPaths;
      Object.defineProperty(wasmEnv, "wasmPaths", {
        configurable: true,
        enumerable: true,
        get() { return _wasmPathsValue; },
        set(value: unknown) {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            const v = value as Record<string, string>;
            if ("wasm" in v) {
              _wasmPathsValue = {
                "ort-wasm-simd-threaded.wasm": v.wasm,
                "ort-wasm-simd.wasm":          v.wasm,
                "ort-wasm-threaded.wasm":       v.wasm,
                "ort-wasm.wasm":               v.wasm,
              };
              return;
            }
          }
          _wasmPathsValue = value;
        },
      });

      setProgress("Downloading AI model (~20 MB, first time only)…");

      const resultBlob = await removeBackground(file, {
        debug: false,
        publicPath: `${window.location.origin}/bg-removal/`,
        model: "isnet",
        output: {
          format: "image/png",
          quality: 1,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            setProgress(
              pct < 100
                ? `Downloading AI model: ${pct}%`
                : "Removing background…"
            );
          }
        },
      });

      setResult(URL.createObjectURL(resultBlob));
      increment();
    } catch (e: unknown) {
      console.error("Background removal error:", e);
      const msg = e instanceof Error ? e.message : "";
      setError(
        "Could not remove background. " +
          (msg ? `(${msg.slice(0, 180)})` : "Please try a different image.")
      );
    } finally {
      setLoading(false);
      setProgress("");
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
      <div className="mb-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <Eraser className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="backgrounds removed" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Background Remover
            </h1>
            <p className="text-muted-foreground mt-2">
              Upload an image and the background is removed instantly. AI runs
              entirely in your browser — nothing is uploaded.
            </p>
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="mb-5 flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <span>
          <strong>First use:</strong> The AI model (~20 MB) downloads once to
          your browser. Runs entirely on your CPU — no upload, no server.
        </span>
      </div>

      {!original ? (
        <ImageDropZone
          dragOver={dragOver}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          title="Drop an image to remove its background"
          subtitle="Works best with clear subjects on solid backgrounds"
          badges={["JPG", "PNG", "WebP"]}
          buttonLabel="Select Image"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </ImageDropZone>
      ) : (
        <div className="space-y-5">
          {/* Before / After */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Original
                </p>
              </div>
              <div className="p-3 bg-muted/20 flex items-center justify-center min-h-[200px]">
                <img
                  src={original}
                  alt="original"
                  className="max-h-[260px] max-w-full rounded-lg object-contain"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Background Removed
                </p>
                {result && !loading && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Done
                  </span>
                )}
              </div>
              {/* Checkerboard shows transparency */}
              <div
                className="p-3 flex items-center justify-center min-h-[200px]"
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(#c8c8d0 0% 25%, #ffffff 0% 50%)",
                  backgroundSize: "18px 18px",
                }}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-3 text-center px-4">
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">{progress}</p>
                  </div>
                ) : result ? (
                  <img
                    src={result}
                    alt="result"
                    className="max-h-[260px] max-w-full rounded-lg object-contain"
                  />
                ) : null}
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
            {loading && (
              <Button disabled className="gap-2 opacity-60">
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress || "Processing…"}
              </Button>
            )}
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              New Image
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {result && !loading && (
            <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> The result is a transparent PNG. Drop it
              into Canva, PowerPoint, or any design tool to place it on any
              background.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
