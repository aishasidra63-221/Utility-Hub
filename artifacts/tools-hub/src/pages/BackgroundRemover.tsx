import { useState, useRef, useCallback } from "react";
import { Download, Eraser, Loader2, RefreshCw } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

// Cached pipeline — downloads model only once per session
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _pipe: any = null;
let _device: "webgpu" | "wasm" = "wasm";

/**
 * Load an image URL into a HTMLImageElement, returning it once loaded.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image: " + src));
    img.src = src;
  });
}

/**
 * Extract pixel data from an image into a canvas context.
 */
function imageToPixels(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Take the original image and a pipeline output blob (the masked/RGBA result).
 * Extracts ONLY the alpha channel from the pipeline blob, applies it to the
 * original image's RGB values. This avoids premultiplied-alpha corruption of
 * colours that occurs when you read pipeline-output pixels through a canvas.
 *
 * Auto-detects inverted masks (where background=opaque, subject=transparent)
 * and corrects them.
 */
async function applyMaskAlphaToOriginal(
  originalUrl: string,
  maskedBlob: Blob
): Promise<Blob> {
  const maskedUrl = URL.createObjectURL(maskedBlob);
  try {
    const [origImg, maskedImg] = await Promise.all([
      loadImage(originalUrl),
      loadImage(maskedUrl),
    ]);

    const W = origImg.naturalWidth;
    const H = origImg.naturalHeight;

    // Read original RGB
    const origData = imageToPixels(origImg);

    // Read masked output to get its alpha channel
    const maskedCanvas = document.createElement("canvas");
    maskedCanvas.width = W;
    maskedCanvas.height = H;
    const maskedCtx = maskedCanvas.getContext("2d")!;
    maskedCtx.drawImage(maskedImg, 0, 0, W, H);
    const maskedData = maskedCtx.getImageData(0, 0, W, H);

    // Determine if the mask is inverted:
    // A correct mask has subject=high alpha (255) and background=low alpha (0).
    // Most images have more background than subject, so avg alpha is normally LOW.
    // If avg alpha is HIGH (> 128), the mask is likely inverted.
    let totalAlpha = 0;
    for (let i = 3; i < maskedData.data.length; i += 4) {
      totalAlpha += maskedData.data[i];
    }
    const avgAlpha = totalAlpha / (W * H);
    const isInverted = avgAlpha > 200;

    // Apply (possibly corrected) alpha from mask onto original RGB
    for (let i = 3; i < origData.data.length; i += 4) {
      const rawAlpha = maskedData.data[i];
      origData.data[i] = isInverted ? 255 - rawAlpha : rawAlpha;
    }

    // Write result to a fresh canvas and export
    const outCanvas = document.createElement("canvas");
    outCanvas.width = W;
    outCanvas.height = H;
    const outCtx = outCanvas.getContext("2d")!;
    outCtx.putImageData(origData, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      outCanvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        "image/png"
      );
    });
  } finally {
    URL.revokeObjectURL(maskedUrl);
  }
}

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
  const [linkCopied, setLinkCopied] = useState(false);
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
    setProgress("Initializing AI…");

    try {
      const { pipeline, env } = await import("@huggingface/transformers");

      // Single-threaded WASM fallback — no SharedArrayBuffer / COOP headers needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (env.backends.onnx as any).wasm.numThreads = 1;

      if (!_pipe) {
        // Detect WebGPU support
        const hasWebGPU =
          typeof navigator !== "undefined" &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !!(navigator as any).gpu;

        _device = hasWebGPU ? "webgpu" : "wasm";

        setProgress(`Downloading AI model (~20 MB, first time only)…`);

        const tryLoad = async (device: "webgpu" | "wasm") => {
          return pipeline("background-removal", "Xenova/modnet", {
            device,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            progress_callback: (prog: any) => {
              if ((prog.status === "download" || prog.status === "progress") && prog.total > 0) {
                setProgress(`Downloading AI model: ${Math.round((prog.loaded / prog.total) * 100)}%`);
              } else if (prog.status === "initiate") {
                setProgress("Preparing AI model…");
              } else if (prog.status === "done") {
                setProgress("Model ready — processing image…");
              }
            },
          });
        };

        try {
          _pipe = await tryLoad(_device);
        } catch (gpuErr) {
          if (_device === "webgpu") {
            console.warn("WebGPU init failed, falling back to WASM:", gpuErr);
            _device = "wasm";
            setProgress("GPU not available, using CPU mode…");
            _pipe = await tryLoad("wasm");
          } else {
            throw gpuErr;
          }
        }
      }

      setProgress("Removing background…");
      const imageUrl = URL.createObjectURL(file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await (_pipe as any)(imageUrl);
      URL.revokeObjectURL(imageUrl);

      // Normalise pipeline output to a single Blob
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let rawBlob: Blob | null = null;

      if (raw && typeof raw.toBlob === "function") {
        // Direct RawImage (transformers v3 / v4 background-removal)
        rawBlob = await raw.toBlob("image/png");
      } else if (Array.isArray(raw) && raw.length > 0) {
        const first = raw[0];
        if (typeof first?.toBlob === "function") {
          rawBlob = await first.toBlob("image/png");
        } else if (first?.mask && typeof first.mask.toBlob === "function") {
          rawBlob = await first.mask.toBlob("image/png");
        }
      }

      if (!rawBlob) {
        throw new Error("Unexpected pipeline output — could not extract result image.");
      }

      setProgress("Compositing result…");
      // Always re-composite: extract alpha-only from model output, apply to
      // original RGB. This avoids colour corruption from premultiplied-alpha
      // reads and also auto-corrects inverted masks.
      const finalBlob = await applyMaskAlphaToOriginal(originalUrl, rawBlob);

      setResult(URL.createObjectURL(finalBlob));
      increment();
    } catch (e: any) {
      console.error("Background removal error:", e);
      _pipe = null; // reset so next attempt re-initialises
      setError(
        "Could not remove background. " +
          (e?.message ? `(${e.message.slice(0, 140)})` : "Please try a different image.")
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
              <UsageCount count={count} label="backgrounds removed" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Background Remover</h1>
            <p className="text-muted-foreground mt-2">
              Upload an image and the background is removed instantly. AI runs entirely in your browser — nothing is uploaded.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      {/* Info notice */}
      <div className="mb-5 flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <span>
          <strong>First use:</strong> The AI model (~20 MB) downloads once to your browser. Runs on your <strong>GPU</strong> if available (Chrome/Edge) for fast results — falls back to CPU otherwise.
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
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>

          {result && !loading && (
            <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> The result is a transparent PNG. Drop it into Canva, PowerPoint, or any design tool to place it on any background.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
