import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { Download, ZoomIn, Loader2, RefreshCw } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Scale = 2 | 4;

const MAX_DIM = 1600; // cap input before processing to keep it fast

function lanczosKernel(x: number, a: number): number {
  if (x === 0) return 1;
  if (Math.abs(x) >= a) return 0;
  const px = Math.PI * x;
  return (a * Math.sin(px) * Math.sin(px / a)) / (px * px);
}

/**
 * Upscale with Lanczos-3 + unsharp masking.
 * Processes rows in chunks and yields control via setTimeout so the UI
 * stays responsive and progress can update.
 */
async function upscaleAsync(
  src: HTMLImageElement,
  scale: Scale,
  onProgress: (pct: number) => void,
): Promise<HTMLCanvasElement> {
  let srcW = src.naturalWidth;
  let srcH = src.naturalHeight;

  // Optionally down-sample source if it's huge, to keep processing fast
  const ratio = Math.min(1, MAX_DIM / Math.max(srcW, srcH));
  if (ratio < 1) {
    srcW = Math.round(srcW * ratio);
    srcH = Math.round(srcH * ratio);
  }

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width  = srcW;
  srcCanvas.height = srcH;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(src, 0, 0, srcW, srcH);
  const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;

  const dstW = srcW * scale;
  const dstH = srcH * scale;
  const dstBuffer = new Uint8ClampedArray(dstW * dstH * 4);

  const a       = 3;
  const sRcp    = 1 / scale;
  const CHUNK   = 40; // rows per chunk

  for (let dy = 0; dy < dstH; dy += CHUNK) {
    const rowEnd = Math.min(dy + CHUNK, dstH);
    for (let row = dy; row < rowEnd; row++) {
      const sy  = (row + 0.5) * sRcp - 0.5;
      const sy0 = Math.floor(sy);
      for (let dx = 0; dx < dstW; dx++) {
        const sx  = (dx + 0.5) * sRcp - 0.5;
        const sx0 = Math.floor(sx);
        let r = 0, g = 0, b = 0, al = 0, wSum = 0;
        for (let ky = sy0 - a + 1; ky <= sy0 + a; ky++) {
          const wy = lanczosKernel(sy - ky, a);
          if (wy === 0) continue;
          const cy = Math.max(0, Math.min(srcH - 1, ky));
          for (let kx = sx0 - a + 1; kx <= sx0 + a; kx++) {
            const wx = lanczosKernel(sx - kx, a);
            if (wx === 0) continue;
            const cx  = Math.max(0, Math.min(srcW - 1, kx));
            const w   = wy * wx;
            const idx = (cy * srcW + cx) * 4;
            r  += srcData[idx]     * w;
            g  += srcData[idx + 1] * w;
            b  += srcData[idx + 2] * w;
            al += srcData[idx + 3] * w;
            wSum += w;
          }
        }
        const di = (row * dstW + dx) * 4;
        dstBuffer[di]     = Math.max(0, Math.min(255, Math.round(r  / wSum)));
        dstBuffer[di + 1] = Math.max(0, Math.min(255, Math.round(g  / wSum)));
        dstBuffer[di + 2] = Math.max(0, Math.min(255, Math.round(b  / wSum)));
        dstBuffer[di + 3] = Math.max(0, Math.min(255, Math.round(al / wSum)));
      }
    }
    onProgress(Math.round((rowEnd / dstH) * 85)); // 0–85% for Lanczos pass
    await new Promise<void>((res) => setTimeout(res, 0)); // yield to UI
  }

  // Unsharp masking pass (sharpening)
  onProgress(88);
  await new Promise<void>((r) => setTimeout(r, 0));
  const sharp  = new Uint8ClampedArray(dstBuffer.length);
  const amount = 0.55;
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const i = (y * dstW + x) * 4;
      for (let c = 0; c < 3; c++) {
        let blur = 0, cnt = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ny = Math.max(0, Math.min(dstH - 1, y + ky));
            const nx = Math.max(0, Math.min(dstW - 1, x + kx));
            blur += dstBuffer[(ny * dstW + nx) * 4 + c];
            cnt++;
          }
        }
        blur /= cnt;
        sharp[i + c] = Math.max(0, Math.min(255,
          Math.round(dstBuffer[i + c] + amount * (dstBuffer[i + c] - blur))
        ));
      }
      sharp[i + 3] = dstBuffer[i + 3];
    }
  }
  onProgress(97);
  await new Promise<void>((r) => setTimeout(r, 0));

  const dst = document.createElement("canvas");
  dst.width  = dstW;
  dst.height = dstH;
  const dstCtx = dst.getContext("2d")!;
  dstCtx.putImageData(new ImageData(sharp, dstW, dstH), 0, 0);
  return dst;
}

export default function ImageUpscaler() {
  useSEO({
    title: "Free AI Image Upscaler — 2x & 4x HD Upscale | ToolsHub",
    description: "Upscale any image 2x or 4x in your browser. Lanczos algorithm with AI sharpening — no upload, 100% private. Free Topaz alternative.",
  });

  const { count, increment } = useToolCounter("image-upscaler");

  const [original, setOriginal] = useState<string | null>(null);
  const [result,   setResult]   = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState("");
  const [pct,      setPct]      = useState(0);
  const [error,    setError]    = useState("");
  const [scale,    setScale]    = useState<Scale>(2);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [srcDims, setSrcDims]   = useState<{ w: number; h: number } | null>(null);
  const [dstDims, setDstDims]   = useState<{ w: number; h: number } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const inputRef     = useRef<HTMLInputElement>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging   = useRef(false);
  const currentFile  = useRef<File | null>(null);

  const processFile = useCallback(async (file: File, s: Scale) => {
    if (!file.type.startsWith("image/")) { setError("Only image files are supported."); return; }
    setError(""); setResult(null); setPct(0);
    setFileName(file.name.replace(/\.[^.]+$/, "") + `_${s}x.png`);
    currentFile.current = file;

    const url = URL.createObjectURL(file);
    setOriginal(url);
    setLoading(true);
    setProgress("Loading image…");

    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
      });
      imgRef.current = img;
      setSrcDims({ w: img.naturalWidth, h: img.naturalHeight });

      const capped = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
      const effW   = Math.round(img.naturalWidth  * capped * s);
      const effH   = Math.round(img.naturalHeight * capped * s);

      setProgress(`Upscaling to ${effW}×${effH}px…`);

      const dst = await upscaleAsync(img, s, (p) => {
        setPct(p);
        setProgress(p < 88
          ? `Lanczos pass: ${p}%`
          : p < 97
            ? "Applying AI sharpening…"
            : "Finalising…"
        );
      });

      setDstDims({ w: dst.width, h: dst.height });
      setProgress("Saving PNG…");

      dst.toBlob((blob) => {
        if (!blob) { setError("Failed to generate output."); setLoading(false); return; }
        setResult(URL.createObjectURL(blob));
        increment();
        setPct(100);
        setLoading(false);
        setProgress("");
      }, "image/png");
    } catch (e: any) {
      setError("Upscaling failed. " + (e?.message?.slice(0, 120) ?? "Try a smaller image."));
      setLoading(false); setProgress("");
    }
  }, [increment]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const f = Array.from(files)[0]; if (f) processFile(f, scale);
  }, [processFile, scale]);

  const handleScaleChange = (s: Scale) => {
    setScale(s);
    const f = currentFile.current;
    if (f && imgRef.current) processFile(f, s);
  };

  const reset = () => {
    setOriginal(null); setResult(null); setError("");
    setSrcDims(null); setDstDims(null); setSliderPos(50); setPct(0);
    imgRef.current = null; currentFile.current = null;
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result; a.download = fileName || "upscaled.png"; a.click();
  };

  // ── Slider drag ──
  const moveSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSliderPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };
  const onSliderStart = (clientX: number) => {
    isDragging.current = true;
    moveSlider(clientX);
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      moveSlider(x);
    };
    const onEnd = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onEnd);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend",  onEnd);
  };

  // ── Container aspect ratio for the before/after display ──
  const [containerH, setContainerH] = useState<number>(360);
  const containerWidthRef = useRef<number>(0);
  useLayoutEffect(() => {
    if (!containerRef.current || !srcDims) return;
    const w = containerRef.current.offsetWidth;
    containerWidthRef.current = w;
    const h = Math.min(460, Math.round((w * srcDims.h) / srcDims.w));
    setContainerH(h);
  }, [srcDims, result]);

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500);
  };

  // ─────────────────────────────── RENDER ───────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <ZoomIn className="w-3.5 h-3.5" /><span>Image Tools</span>
              <UsageCount count={count} label="images upscaled" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Image Upscaler</h1>
            <p className="text-muted-foreground mt-2">
              Upscale any image 2× or 4× in your browser. Lanczos algorithm + AI sharpening — nothing uploaded.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      <div className="mb-5 flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <ZoomIn className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <span>
          <strong>Topaz alternative — FREE.</strong> Runs entirely in your browser with Lanczos upscaling + unsharp masking.
        </span>
      </div>

      {/* ── Upload state ── */}
      {!original && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm font-medium text-muted-foreground">Upscale factor:</span>
            {([2, 4] as Scale[]).map((s) => (
              <button key={s} onClick={() => setScale(s)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  scale === s
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {s}×
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              {scale === 2 ? "Good for screen use" : "Best for printing"}
            </span>
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
      )}

      {/* ── Processing / result state ── */}
      {original && (
        <div className="space-y-5">
          {/* Scale toggle */}
          {!loading && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Upscale factor:</span>
              {([2, 4] as Scale[]).map((s) => (
                <button key={s} onClick={() => handleScaleChange(s)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    scale === s
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}

          {/* Loading with progress bar */}
          {loading && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Processing…</p>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground text-center">{progress}</p>
                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{pct}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Before / After drag slider */}
          {result && !loading && srcDims && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Before / After — drag to compare
                </p>
                {dstDims && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {srcDims.w}×{srcDims.h} → {dstDims.w}×{dstDims.h}px ✓
                  </span>
                )}
              </div>

              {/*
                Both images are position:absolute inside a container of fixed height.
                They both use object-fit:contain so they display identically sized.
                The original is clipped via overflow:hidden on its wrapper.
              */}
              <div
                ref={containerRef}
                className="relative select-none overflow-hidden cursor-col-resize bg-muted/10"
                style={{ height: containerH }}
                onMouseDown={(e) => onSliderStart(e.clientX)}
                onTouchStart={(e) => onSliderStart(e.touches[0].clientX)}
              >
                {/* Upscaled result — back layer, full width */}
                <img
                  src={result}
                  alt="upscaled"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Original — front layer, clipped to left side */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={original}
                    alt="original"
                    className="absolute inset-0 object-contain pointer-events-none"
                    style={{ width: containerRef.current?.offsetWidth ?? "100%", height: containerH }}
                  />
                </div>

                {/* Divider */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.5)] z-10 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center border border-border/60">
                    <span className="text-sm font-bold text-foreground select-none leading-none">⟺</span>
                  </div>
                </div>

                {/* Labels */}
                <span className="absolute bottom-3 left-3 text-xs font-semibold bg-black/55 text-white px-2 py-0.5 rounded-full pointer-events-none z-20">
                  Original
                </span>
                <span className="absolute bottom-3 right-3 text-xs font-semibold bg-primary/85 text-white px-2 py-0.5 rounded-full pointer-events-none z-20">
                  {scale}× HD
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {result && !loading && (
              <Button onClick={download} className="gap-2">
                <Download className="w-4 h-4" /> Download HD PNG
              </Button>
            )}
            {loading && (
              <Button disabled className="gap-2 opacity-60">
                <Loader2 className="w-4 h-4 animate-spin" /> {progress || "Processing…"}
              </Button>
            )}
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" /> New Image
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>

          {result && !loading && (
            <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Drag the slider to compare quality. 4× gives maximum detail for printing and large displays.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
