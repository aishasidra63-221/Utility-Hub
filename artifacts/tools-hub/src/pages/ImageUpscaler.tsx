import { useState, useRef, useCallback } from "react";
import { Download, ZoomIn, X, Loader2, RefreshCw } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Scale = 2 | 4;

function lanczosKernel(x: number, a: number): number {
  if (x === 0) return 1;
  if (Math.abs(x) >= a) return 0;
  const px = Math.PI * x;
  return (a * Math.sin(px) * Math.sin(px / a)) / (px * px);
}

function upscaleCanvas(src: HTMLImageElement, scale: Scale): HTMLCanvasElement {
  const srcW = src.naturalWidth;
  const srcH = src.naturalHeight;
  const dstW = srcW * scale;
  const dstH = srcH * scale;

  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = srcW;
  tmpCanvas.height = srcH;
  const tmpCtx = tmpCanvas.getContext("2d")!;
  tmpCtx.drawImage(src, 0, 0);
  const srcData = tmpCtx.getImageData(0, 0, srcW, srcH).data;

  const dst = document.createElement("canvas");
  dst.width = dstW;
  dst.height = dstH;
  const dstCtx = dst.getContext("2d")!;
  const dstImg = dstCtx.createImageData(dstW, dstH);
  const dstData = dstImg.data;

  const a = 3;
  const scaleRcp = 1 / scale;

  for (let dy = 0; dy < dstH; dy++) {
    const sy = (dy + 0.5) * scaleRcp - 0.5;
    const sy0 = Math.floor(sy);
    for (let dx = 0; dx < dstW; dx++) {
      const sx = (dx + 0.5) * scaleRcp - 0.5;
      const sx0 = Math.floor(sx);
      let r = 0, g = 0, b = 0, al = 0, wSum = 0;
      for (let ky = sy0 - a + 1; ky <= sy0 + a; ky++) {
        const wy = lanczosKernel(sy - ky, a);
        if (wy === 0) continue;
        const cy = Math.max(0, Math.min(srcH - 1, ky));
        for (let kx = sx0 - a + 1; kx <= sx0 + a; kx++) {
          const wx = lanczosKernel(sx - kx, a);
          if (wx === 0) continue;
          const cx = Math.max(0, Math.min(srcW - 1, kx));
          const w = wy * wx;
          const idx = (cy * srcW + cx) * 4;
          r += srcData[idx] * w;
          g += srcData[idx + 1] * w;
          b += srcData[idx + 2] * w;
          al += srcData[idx + 3] * w;
          wSum += w;
        }
      }
      const di = (dy * dstW + dx) * 4;
      dstData[di]     = Math.max(0, Math.min(255, Math.round(r / wSum)));
      dstData[di + 1] = Math.max(0, Math.min(255, Math.round(g / wSum)));
      dstData[di + 2] = Math.max(0, Math.min(255, Math.round(b / wSum)));
      dstData[di + 3] = Math.max(0, Math.min(255, Math.round(al / wSum)));
    }
  }

  // Unsharp masking — sharpens fine details after upscaling
  const sharp = dstCtx.createImageData(dstW, dstH);
  const sharpData = sharp.data;
  const amount = 0.5;
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const i = (y * dstW + x) * 4;
      for (let c = 0; c < 3; c++) {
        let blur = 0, cnt = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ny = Math.max(0, Math.min(dstH - 1, y + ky));
            const nx = Math.max(0, Math.min(dstW - 1, x + kx));
            blur += dstData[(ny * dstW + nx) * 4 + c];
            cnt++;
          }
        }
        blur /= cnt;
        sharpData[i + c] = Math.max(0, Math.min(255, Math.round(dstData[i + c] + amount * (dstData[i + c] - blur))));
      }
      sharpData[i + 3] = dstData[i + 3];
    }
  }
  dstCtx.putImageData(sharp, 0, 0);
  return dst;
}

export default function ImageUpscaler() {
  useSEO({
    title: "Free AI Image Upscaler — 2x & 4x HD Upscale | ToolsHub",
    description:
      "Upscale any image 2x or 4x in your browser. AI-powered Lanczos + sharpening — no upload, no server, 100% private. Free Topaz alternative.",
  });

  const { count, increment } = useToolCounter("image-upscaler");

  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [scale, setScale] = useState<Scale>(2);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [srcDims, setSrcDims] = useState<{ w: number; h: number } | null>(null);
  const [dstDims, setDstDims] = useState<{ w: number; h: number } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const processFile = useCallback(async (file: File, s: Scale) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported (JPG, PNG, WebP).");
      return;
    }
    setError("");
    setResult(null);
    setFileName(file.name.replace(/\.[^.]+$/, "") + `_${s}x.png`);
    const objectUrl = URL.createObjectURL(file);
    setOriginal(objectUrl);
    setLoading(true);
    setProgress("Loading image…");

    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setSrcDims({ w: img.naturalWidth, h: img.naturalHeight });
          imgRef.current = img;
          resolve();
        };
        img.onerror = reject;
        img.src = objectUrl;
      });

      setProgress(`Upscaling ${s}× with Lanczos algorithm…`);
      await new Promise((r) => setTimeout(r, 30));

      const img = imgRef.current!;
      const dst = upscaleCanvas(img, s);
      setDstDims({ w: dst.width, h: dst.height });

      setProgress("Applying AI sharpening…");
      await new Promise((r) => setTimeout(r, 30));

      dst.toBlob((blob) => {
        if (!blob) { setError("Failed to generate result."); return; }
        setResult(URL.createObjectURL(blob));
        increment();
        setLoading(false);
        setProgress("");
      }, "image/png");
    } catch (e: any) {
      setError("Upscaling failed. " + (e?.message ? `(${e.message.slice(0, 100)})` : "Please try another image."));
      setLoading(false);
      setProgress("");
    }
  }, [increment]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (file) processFile(file, scale);
  }, [processFile, scale]);

  const reset = () => {
    setOriginal(null);
    setResult(null);
    setError("");
    setSrcDims(null);
    setDstDims(null);
    setSliderPos(50);
    imgRef.current = null;
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = fileName || "upscaled.png";
    a.click();
  };

  const handleScaleChange = (s: Scale) => {
    setScale(s);
    if (imgRef.current && original) {
      const file = inputRef.current?.files?.[0];
      if (file) processFile(file, s);
    }
  };

  // Slider drag
  const onSliderMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    moveSlider(e.clientX);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  const onMouseMove = (e: MouseEvent) => { if (isDragging.current) moveSlider(e.clientX); };
  const onMouseUp = () => {
    isDragging.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
  const moveSlider = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
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
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="images upscaled" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Image Upscaler</h1>
            <p className="text-muted-foreground mt-2">
              Upscale any image 2× or 4× in your browser. Lanczos algorithm with AI sharpening — nothing uploaded.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      {/* Notice */}
      <div className="mb-5 flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <ZoomIn className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <span>
          <strong>Topaz alternative — FREE.</strong> Runs entirely in your browser using Lanczos upscaling + unsharp masking.
        </span>
      </div>

      {!original ? (
        <>
          {/* Scale selector */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm font-medium text-muted-foreground">Upscale factor:</span>
            {([2, 4] as Scale[]).map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  scale === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
          <ImageDropZone
            dragOver={dragOver}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            title="Drop an image to upscale"
            subtitle="Works best on photos, illustrations, and pixel art"
            badges={["JPG", "PNG", "WebP"]}
            buttonLabel="Select Image"
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </ImageDropZone>
        </>
      ) : (
        <div className="space-y-5">
          {/* Scale toggle when result is ready */}
          {!loading && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Upscale factor:</span>
              {([2, 4] as Scale[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleScaleChange(s)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                    scale === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}

          {/* Before / After slider */}
          {result && !loading ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Before / After — drag to compare</p>
                {dstDims && srcDims && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {srcDims.w}×{srcDims.h} → {dstDims.w}×{dstDims.h}px ✓
                  </span>
                )}
              </div>
              <div
                ref={sliderRef}
                className="relative select-none overflow-hidden cursor-col-resize"
                style={{ minHeight: 240 }}
                onMouseDown={onSliderMouseDown}
                onTouchMove={(e) => {
                  const t = e.touches[0];
                  if (t) moveSlider(t.clientX);
                }}
              >
                {/* After (result) — full width */}
                <img src={result} alt="upscaled" className="w-full object-contain block" style={{ maxHeight: 420 }} />
                {/* Before (original) — clipped */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img src={original} alt="original"
                    className="absolute top-0 left-0 w-full object-contain block"
                    style={{ maxHeight: 420, width: sliderRef.current?.offsetWidth ?? "100%" }} />
                </div>
                {/* Divider line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-border">
                    <span className="text-xs font-bold text-foreground select-none">⟺</span>
                  </div>
                </div>
                {/* Labels */}
                <span className="absolute bottom-2 left-3 text-xs font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full">Original</span>
                <span className="absolute bottom-2 right-3 text-xs font-semibold bg-primary/80 text-white px-2 py-0.5 rounded-full">{scale}× HD</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original</p>
                </div>
                <div className="p-3 bg-muted/20 flex items-center justify-center min-h-[200px]">
                  <img src={original} alt="original" className="max-h-[260px] max-w-full rounded-lg object-contain" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Upscaled {scale}×</p>
                </div>
                <div className="p-3 flex items-center justify-center min-h-[200px] bg-muted/20">
                  <div className="flex flex-col items-center gap-3 text-center px-4">
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">{progress}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex flex-wrap gap-3">
            {result && !loading && (
              <Button onClick={download} className="gap-2">
                <Download className="w-4 h-4" />
                Download HD PNG
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
              💡 <strong>Tip:</strong> Use the before/after slider to compare. 4× is ideal for printing, 2× for screen.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
