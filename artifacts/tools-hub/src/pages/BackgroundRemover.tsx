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

/**
 * Check if a PNG blob has any non-transparent pixels.
 * Returns { hasContent, invertedBlob } where invertedBlob is
 * the blob with alpha inverted if no content was found.
 */
async function validateAndFixAlpha(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Count pixels that have alpha > 10 (anything visible)
      let visiblePixels = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 10) visiblePixels++;
      }

      const totalPixels = canvas.width * canvas.height;
      const visibleRatio = visiblePixels / totalPixels;

      if (visibleRatio > 0.01) {
        // Output looks fine — return as-is
        resolve(blob);
        return;
      }

      // Nothing visible — mask is likely inverted. Flip all alpha values.
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255 - imageData.data[i];
      }
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((fixed) => {
        if (fixed) resolve(fixed);
        else reject(new Error("Failed to fix alpha channel"));
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load result")); };
    img.src = url;
  });
}

/**
 * Apply a greyscale mask image to an original image as its alpha channel.
 * Used as a fallback when the pipeline gives us raw segmentation masks.
 */
async function applyMaskToImage(
  originalUrl: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maskImage: any,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const orig = new Image();
    orig.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = orig.naturalWidth;
      canvas.height = orig.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(orig, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // maskImage may be a RawImage — get its grayscale data
      const maskCanvas = document.createElement("canvas");
      const mw = maskImage.width ?? canvas.width;
      const mh = maskImage.height ?? canvas.height;
      maskCanvas.width  = mw;
      maskCanvas.height = mh;
      const mCtx = maskCanvas.getContext("2d")!;

      // Draw mask onto canvas to get pixel data
      // RawImage can be converted to ImageData directly
      if (maskImage.data instanceof Uint8ClampedArray || maskImage.data instanceof Uint8Array) {
        const channels = maskImage.channels ?? 1;
        for (let i = 0; i < mw * mh; i++) {
          const val = maskImage.data[i * channels]; // first channel = grey
          // Scale to original image dimensions
          const destX = Math.round((i % mw) * (canvas.width  / mw));
          const destY = Math.round(Math.floor(i / mw) * (canvas.height / mh));
          const destI = (destY * canvas.width + destX) * 4;
          if (destI + 3 < imgData.data.length) imgData.data[destI + 3] = val;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((b) => { if (b) resolve(b); else reject(new Error("toBlob failed")); }, "image/png");
    };
    orig.onerror = reject;
    orig.src = originalUrl;
  });
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

      // Single-threaded WASM — no SharedArrayBuffer / COOP headers needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (env.backends.onnx as any).wasm.numThreads = 1;

      if (!_pipe) {
        setProgress("Downloading AI model (~20 MB, first time only)…");
        _pipe = await pipeline("background-removal", "Xenova/modnet", {
          device: "wasm",
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
      }

      setProgress("Removing background…");
      const imageUrl = URL.createObjectURL(file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await (_pipe as any)(imageUrl);
      URL.revokeObjectURL(imageUrl);

      // ── Handle v3 (RawImage) and v4 (array / segmentation) output ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resultBlob: Blob | null = null;

      if (raw && typeof raw.toBlob === "function") {
        // Direct RawImage (transformers v3 / some v4 builds)
        resultBlob = await raw.toBlob("image/png");
      } else if (Array.isArray(raw) && raw.length > 0) {
        const first = raw[0];
        if (typeof first?.toBlob === "function") {
          // Array<RawImage>
          resultBlob = await first.toBlob("image/png");
        } else if (first?.mask) {
          // Segmentation-style: [{ label, score, mask: RawImage }]
          setProgress("Applying mask…");
          resultBlob = await applyMaskToImage(originalUrl, first.mask);
        }
      }

      if (!resultBlob) {
        throw new Error("Unexpected pipeline output — could not extract result image.");
      }

      setProgress("Validating result…");
      // Detect & fix inverted alpha (whole image transparent)
      const fixedBlob = await validateAndFixAlpha(resultBlob);

      setResult(URL.createObjectURL(fixedBlob));
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
          <strong>First use:</strong> The AI model (~20 MB) downloads once to your browser. After that it runs offline — no internet needed.
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
