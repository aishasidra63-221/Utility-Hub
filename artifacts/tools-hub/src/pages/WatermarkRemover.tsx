import { useState, useRef, useCallback, useEffect } from "react";
import { Download, Droplets, Loader2, RefreshCw, MousePointer, Wand2 } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

interface Rect { x: number; y: number; w: number; h: number }

/**
 * Content-aware patch: fills a rectangular region by sampling pixels from
 * surrounding border and blending inward with distance-weighted interpolation.
 */
function patchRegion(imgData: ImageData, rect: Rect, patchRadius = 12): void {
  const { data, width, height } = imgData;
  const { x, y, w, h } = rect;
  const x1 = Math.max(0, x);
  const y1 = Math.max(0, y);
  const x2 = Math.min(width - 1, x + w);
  const y2 = Math.min(height - 1, y + h);

  // Collect border samples
  const samples: { px: number; py: number }[] = [];
  const pr = Math.min(patchRadius, 20);
  for (let bx = x1 - pr; bx <= x2 + pr; bx++) {
    for (let by = y1 - pr; by <= y2 + pr; by++) {
      if (bx < x1 || bx > x2 || by < y1 || by > y2) {
        if (bx >= 0 && bx < width && by >= 0 && by < height) {
          samples.push({ px: bx, py: by });
        }
      }
    }
  }

  // For each interior pixel, fill with weighted average of border samples
  for (let py = y1; py <= y2; py++) {
    for (let px = x1; px <= x2; px++) {
      let rSum = 0, gSum = 0, bSum = 0, wSum = 0;
      for (const s of samples) {
        const dx = px - s.px;
        const dy = py - s.py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.5) continue;
        const w = 1 / (dist * dist);
        const si = (s.py * width + s.px) * 4;
        rSum += data[si] * w;
        gSum += data[si + 1] * w;
        bSum += data[si + 2] * w;
        wSum += w;
      }
      if (wSum > 0) {
        const di = (py * width + px) * 4;
        data[di]     = Math.round(rSum / wSum);
        data[di + 1] = Math.round(gSum / wSum);
        data[di + 2] = Math.round(bSum / wSum);
      }
    }
  }
}

export default function WatermarkRemover() {
  useSEO({
    title: "Free Watermark Remover — Remove Watermarks from Images | ToolsHub",
    description:
      "Remove watermarks from images using AI content-aware fill. Draw over the watermark, let AI patch it. 100% private, browser only.",
  });

  const { count, increment } = useToolCounter("watermark-remover");

  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [rects, setRects] = useState<Rect[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<Rect | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const imgDataRef = useRef<ImageData | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drawStart = useRef<{ x: number; y: number } | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported (JPG, PNG, WebP).");
      return;
    }
    setError("");
    setResult(null);
    setRects([]);
    setCurrentRect(null);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_clean.png");
    const objectUrl = URL.createObjectURL(file);
    setOriginal(objectUrl);

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = objectUrl;
    });
    imgRef.current = img;
  }, []);

  // Draw image onto canvas when original loads
  useEffect(() => {
    if (!original || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    imgDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, [original]);

  // Detect bright/white watermark patches automatically
  const autoDetect = useCallback(() => {
    if (!imgDataRef.current) return;
    const { data, width, height } = imgDataRef.current;
    const blockSize = Math.max(4, Math.round(Math.min(width, height) / 80));
    const found: Rect[] = [];

    for (let by = 0; by < height - blockSize; by += blockSize) {
      for (let bx = 0; bx < width - blockSize; bx += blockSize) {
        let brightCnt = 0;
        for (let dy = 0; dy < blockSize; dy++) {
          for (let dx = 0; dx < blockSize; dx++) {
            const i = ((by + dy) * width + (bx + dx)) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            // High brightness with low saturation = likely watermark
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
            if (lum > 210 && sat < 0.15) brightCnt++;
          }
        }
        if (brightCnt > blockSize * blockSize * 0.7) {
          found.push({ x: bx, y: by, w: blockSize, h: blockSize });
        }
      }
    }

    // Merge adjacent blocks
    const merged: Rect[] = [];
    const used = new Set<number>();
    for (let i = 0; i < found.length; i++) {
      if (used.has(i)) continue;
      let { x, y, w, h } = found[i];
      let changed = true;
      while (changed) {
        changed = false;
        for (let j = i + 1; j < found.length; j++) {
          if (used.has(j)) continue;
          const f = found[j];
          if (f.x <= x + w + blockSize && f.x + f.w >= x - blockSize &&
              f.y <= y + h + blockSize && f.y + f.h >= y - blockSize) {
            x = Math.min(x, f.x);
            y = Math.min(y, f.y);
            const x2 = Math.max(x + w, f.x + f.w);
            const y2 = Math.max(y + h, f.y + f.h);
            w = x2 - x; h = y2 - y;
            used.add(j);
            changed = true;
          }
        }
      }
      used.add(i);
      if (w > blockSize * 2 && h > blockSize * 2) merged.push({ x, y, w, h });
    }

    setRects(merged.slice(0, 8));
    if (merged.length === 0) {
      setError("No watermark detected automatically. Switch to manual mode to draw over it.");
    }
  }, []);

  useEffect(() => {
    if (original && mode === "auto") autoDetect();
  }, [original, mode, autoDetect]);

  // Draw overlay rects
  useEffect(() => {
    if (!overlayRef.current || !imgRef.current) return;
    const overlay = overlayRef.current;
    const img = imgRef.current;
    overlay.width = img.naturalWidth;
    overlay.height = img.naturalHeight;
    const ctx = overlay.getContext("2d")!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctx.strokeStyle = "rgba(239,68,68,0.9)";
    ctx.lineWidth = Math.max(2, img.naturalWidth / 300);
    ctx.fillStyle = "rgba(239,68,68,0.15)";
    for (const r of rects) {
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    if (currentRect) {
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
    }
  }, [rects, currentRect]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "manual") return;
    const { x, y } = getCanvasCoords(e);
    drawStart.current = { x, y };
    setDrawing(true);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !drawStart.current || mode !== "manual") return;
    const { x, y } = getCanvasCoords(e);
    const sx = drawStart.current.x, sy = drawStart.current.y;
    setCurrentRect({
      x: Math.min(sx, x), y: Math.min(sy, y),
      w: Math.abs(x - sx), h: Math.abs(y - sy),
    });
  };
  const onMouseUp = () => {
    if (!drawing || !currentRect) { setDrawing(false); return; }
    if (currentRect.w > 5 && currentRect.h > 5) {
      setRects((prev) => [...prev, currentRect]);
    }
    setCurrentRect(null);
    setDrawing(false);
  };

  const removeWatermarks = useCallback(async () => {
    if (!imgDataRef.current || rects.length === 0) return;
    setLoading(true);
    setProgress("Applying content-aware fill…");
    await new Promise((r) => setTimeout(r, 30));

    try {
      const imgData = new ImageData(
        new Uint8ClampedArray(imgDataRef.current.data),
        imgDataRef.current.width,
        imgDataRef.current.height,
      );
      for (const rect of rects) {
        patchRegion(imgData, rect);
      }
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = imgData.width;
      tmpCanvas.height = imgData.height;
      const ctx = tmpCanvas.getContext("2d")!;
      ctx.putImageData(imgData, 0, 0);
      tmpCanvas.toBlob((blob) => {
        if (!blob) { setError("Failed to generate result."); return; }
        setResult(URL.createObjectURL(blob));
        increment();
        setLoading(false);
        setProgress("");
      }, "image/png");
    } catch (e: any) {
      setError("Removal failed. " + (e?.message?.slice(0, 100) ?? ""));
      setLoading(false);
      setProgress("");
    }
  }, [imgDataRef, rects, increment]);

  const reset = () => {
    setOriginal(null); setResult(null); setError("");
    setRects([]); setCurrentRect(null);
    imgRef.current = null; imgDataRef.current = null;
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = fileName || "clean.png";
    a.click();
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <Droplets className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="watermarks removed" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Watermark Remover</h1>
            <p className="text-muted-foreground mt-2">
              AI detects and removes watermarks using content-aware fill. Or draw over them manually — everything runs in your browser.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      <div className="mb-5 flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <Wand2 className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <span>
          <strong>Browser only.</strong> No image is uploaded to any server. Content-aware fill reconstructs the patched area from surrounding pixels.
        </span>
      </div>

      {!original ? (
        <ImageDropZone
          dragOver={dragOver}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          title="Drop a watermarked image"
          subtitle="Best for white/light watermarks. Use manual mode for logos or dark marks."
          badges={["JPG", "PNG", "WebP"]}
          buttonLabel="Select Image"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </ImageDropZone>
      ) : result ? (
        <div className="space-y-5">
          {/* Before / after */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Before</p>
              </div>
              <div className="p-3 bg-muted/20 flex items-center justify-center min-h-[180px]">
                <img src={original} alt="original" className="max-h-[260px] max-w-full rounded-lg object-contain" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">After</p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Clean</span>
              </div>
              <div className="p-3 bg-muted/20 flex items-center justify-center min-h-[180px]">
                <img src={result} alt="result" className="max-h-[260px] max-w-full rounded-lg object-contain" />
              </div>
            </div>
          </div>
          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>}
          <div className="flex flex-wrap gap-3">
            <Button onClick={download} className="gap-2">
              <Download className="w-4 h-4" />
              Download Clean Image
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              New Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Detection mode:</span>
            <button
              onClick={() => { setMode("auto"); setRects([]); if (original) autoDetect(); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all gap-2 flex items-center ${
                mode === "auto" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" /> Auto Detect
            </button>
            <button
              onClick={() => { setMode("manual"); setRects([]); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all gap-2 flex items-center ${
                mode === "manual" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" /> Manual Draw
            </button>
          </div>

          {mode === "manual" && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
              Draw rectangles over the watermark(s) on the image below, then click Remove.
            </div>
          )}

          {/* Canvas with overlay */}
          <div className="relative bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {mode === "auto" ? `${rects.length} region${rects.length !== 1 ? "s" : ""} detected` : "Draw over watermarks"}
              </p>
              {rects.length > 0 && (
                <button onClick={() => setRects([])} className="text-xs text-destructive hover:underline">Clear all</button>
              )}
            </div>
            <div className="relative w-full" style={{ maxHeight: 420, overflow: "hidden" }}>
              <canvas ref={canvasRef} className="w-full object-contain block" style={{ display: "block" }} />
              <canvas
                ref={overlayRef}
                className="absolute inset-0 w-full h-full"
                style={{ cursor: mode === "manual" ? "crosshair" : "default" }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              />
            </div>
          </div>

          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={removeWatermarks}
              disabled={rects.length === 0 || loading}
              className="gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{progress || "Removing…"}</>
              ) : (
                <><Wand2 className="w-4 h-4" />Remove Watermark{rects.length > 1 ? "s" : ""}</>
              )}
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              New Image
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>
        </div>
      )}
    </div>
  );
}
