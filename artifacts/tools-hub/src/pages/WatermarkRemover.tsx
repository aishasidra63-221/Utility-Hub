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
 * Content-aware patch: fills a rect by blending surrounding border pixels.
 * Uses inverse-distance weighting from a border ring of `patchRadius` px.
 */
function patchRegion(imgData: ImageData, rect: Rect, patchRadius = 14): void {
  const { data, width, height } = imgData;
  const x1 = Math.max(0, rect.x);
  const y1 = Math.max(0, rect.y);
  const x2 = Math.min(width  - 1, rect.x + rect.w);
  const y2 = Math.min(height - 1, rect.y + rect.h);
  const pr = Math.min(patchRadius, 24);

  // Collect border samples (outside the rect)
  const samples: { px: number; py: number }[] = [];
  for (let bx = x1 - pr; bx <= x2 + pr; bx++) {
    for (let by = y1 - pr; by <= y2 + pr; by++) {
      if ((bx < x1 || bx > x2 || by < y1 || by > y2) &&
           bx >= 0 && bx < width && by >= 0 && by < height) {
        samples.push({ px: bx, py: by });
      }
    }
  }

  // Fill each interior pixel with IDW-blended border colours
  for (let py = y1; py <= y2; py++) {
    for (let px = x1; px <= x2; px++) {
      let rS = 0, gS = 0, bS = 0, wS = 0;
      for (const s of samples) {
        const d = Math.hypot(px - s.px, py - s.py);
        if (d < 0.5) continue;
        const w = 1 / (d * d);
        const si = (s.py * width + s.px) * 4;
        rS += data[si]     * w;
        gS += data[si + 1] * w;
        bS += data[si + 2] * w;
        wS += w;
      }
      if (wS > 0) {
        const di = (py * width + px) * 4;
        data[di]     = Math.round(rS / wS);
        data[di + 1] = Math.round(gS / wS);
        data[di + 2] = Math.round(bS / wS);
      }
    }
  }
}

export default function WatermarkRemover() {
  useSEO({
    title: "Free Watermark Remover — Remove Watermarks from Images | ToolsHub",
    description:
      "Remove watermarks from images with content-aware fill. Draw over them manually — 100% private, browser only.",
  });

  const { count, increment } = useToolCounter("watermark-remover");

  const [original,    setOriginal]    = useState<string | null>(null);
  const [result,      setResult]      = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [progress,    setProgress]    = useState("");
  const [error,       setError]       = useState("");
  const [fileName,    setFileName]    = useState("");
  const [dragOver,    setDragOver]    = useState(false);
  const [linkCopied,  setLinkCopied]  = useState(false);
  const [mode,        setMode]        = useState<"auto" | "manual">("manual");
  const [rects,       setRects]       = useState<Rect[]>([]);
  const [currentRect, setCurrentRect] = useState<Rect | null>(null);

  const inputRef   = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const imgRef     = useRef<HTMLImageElement | null>(null);
  const imgDataRef = useRef<ImageData | null>(null);
  const drawStart  = useRef<{ x: number; y: number } | null>(null);
  const isDrawing  = useRef(false);

  // ── Load file: create img element and cache pixel data ──
  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported (JPG, PNG, WebP).");
      return;
    }
    setError(""); setResult(null); setRects([]); setCurrentRect(null);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_clean.png");

    const url = URL.createObjectURL(file);

    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
    });
    imgRef.current = img;

    // Capture pixel data into an off-screen canvas
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width  = img.naturalWidth;
    tmpCanvas.height = img.naturalHeight;
    const ctx = tmpCanvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    imgDataRef.current = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);

    setOriginal(url);
  }, []);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const f = Array.from(files)[0]; if (f) processFile(f);
  }, [processFile]);

  // ── Auto-detect bright/white watermark patches ──
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
            const lum  = 0.299 * r + 0.587 * g + 0.114 * b;
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const sat  = maxC > 0 ? (maxC - minC) / maxC : 0;
            if (lum > 210 && sat < 0.15) brightCnt++;
          }
        }
        if (brightCnt > blockSize * blockSize * 0.65) {
          found.push({ x: bx, y: by, w: blockSize, h: blockSize });
        }
      }
    }

    // Merge adjacent / overlapping blocks
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
            const nx2 = Math.max(x + w, f.x + f.w);
            const ny2 = Math.max(y + h, f.y + f.h);
            x = Math.min(x, f.x); y = Math.min(y, f.y);
            w = nx2 - x; h = ny2 - y;
            used.add(j); changed = true;
          }
        }
      }
      used.add(i);
      if (w > blockSize * 2 && h > blockSize * 2) merged.push({ x, y, w, h });
    }

    if (merged.length === 0) {
      setError("No bright watermark detected. Switch to Manual mode to draw over it yourself.");
    } else {
      setError("");
      setRects(merged.slice(0, 8));
    }
  }, []);

  // Run auto-detect when image loads in auto mode
  useEffect(() => {
    if (original && mode === "auto") autoDetect();
  }, [original, mode, autoDetect]);

  // ── Overlay canvas: sync dimensions and redraw rects ──
  useEffect(() => {
    const overlay = overlayRef.current;
    const img     = imgRef.current;
    if (!overlay || !img) return;

    if (overlay.width  !== img.naturalWidth)  overlay.width  = img.naturalWidth;
    if (overlay.height !== img.naturalHeight) overlay.height = img.naturalHeight;

    const ctx = overlay.getContext("2d")!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctx.strokeStyle = "rgba(239,68,68,0.9)";
    ctx.fillStyle   = "rgba(239,68,68,0.18)";
    ctx.lineWidth   = Math.max(2, img.naturalWidth / 300);

    for (const r of rects) {
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    if (currentRect) {
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
    }
  }, [rects, currentRect, original]); // `original` triggers dim-init on first load

  // ── Canvas coordinate conversion (CSS px → image px) ──
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = overlayRef.current!;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - bounds.left)  * (canvas.width  / bounds.width),
      y: (e.clientY - bounds.top)   * (canvas.height / bounds.height),
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "manual") return;
    e.preventDefault();
    drawStart.current = getCoords(e);
    isDrawing.current = true;
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !drawStart.current) return;
    const { x, y } = getCoords(e);
    const sx = drawStart.current.x, sy = drawStart.current.y;
    setCurrentRect({
      x: Math.min(sx, x), y: Math.min(sy, y),
      w: Math.abs(x - sx), h: Math.abs(y - sy),
    });
  };
  const onMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentRect && currentRect.w > 6 && currentRect.h > 6) {
      setRects((prev) => [...prev, currentRect]);
    }
    setCurrentRect(null);
    drawStart.current = null;
  };

  // ── Apply content-aware fill to all marked regions ──
  const removeWatermarks = useCallback(async () => {
    if (!imgDataRef.current || rects.length === 0) return;
    setLoading(true);
    setProgress("Applying content-aware fill…");
    await new Promise((r) => setTimeout(r, 30));

    try {
      // Deep-copy pixel data so we don't mutate the original
      const imgData = new ImageData(
        new Uint8ClampedArray(imgDataRef.current.data),
        imgDataRef.current.width,
        imgDataRef.current.height,
      );
      for (const rect of rects) {
        patchRegion(imgData, rect);
      }

      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width  = imgData.width;
      tmpCanvas.height = imgData.height;
      tmpCanvas.getContext("2d")!.putImageData(imgData, 0, 0);

      tmpCanvas.toBlob((blob) => {
        if (!blob) { setError("Failed to generate result."); setLoading(false); return; }
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
  }, [rects, increment]);

  const reset = () => {
    setOriginal(null); setResult(null); setError("");
    setRects([]); setCurrentRect(null);
    imgRef.current = null; imgDataRef.current = null;
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result; a.download = fileName || "clean.png"; a.click();
  };

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
              <Droplets className="w-3.5 h-3.5" /><span>Image Tools</span>
              <UsageCount count={count} label="watermarks removed" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Watermark Remover</h1>
            <p className="text-muted-foreground mt-2">
              Draw over any watermark and AI fills it in seamlessly. Or let auto-detect find white/bright marks. 100% browser — nothing uploaded.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      <div className="mb-5 flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <Wand2 className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <span>
          <strong>Content-aware fill.</strong> Reconstructs the patched area from surrounding pixels — no image leaves your browser.
        </span>
      </div>

      {/* ── Upload state ── */}
      {!original && (
        <ImageDropZone
          dragOver={dragOver}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          title="Drop a watermarked image"
          subtitle="Draw over the watermark to remove it — works on any type"
          badges={["JPG", "PNG", "WebP"]}
          buttonLabel="Select Image"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </ImageDropZone>
      )}

      {/* ── Result state ── */}
      {original && result && (
        <div className="space-y-5">
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
              <Download className="w-4 h-4" /> Download Clean Image
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" /> New Image
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> For better results on complex backgrounds, try drawing smaller, more precise rectangles around just the watermark text.
          </div>
        </div>
      )}

      {/* ── Drawing / processing state ── */}
      {original && !result && (
        <div className="space-y-5">
          {/* Mode toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Mode:</span>
            {(["manual", "auto"] as const).map((m) => (
              <button key={m}
                onClick={() => {
                  setMode(m); setRects([]); setError("");
                  if (m === "auto") autoDetect();
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                  mode === m
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {m === "manual"
                  ? <><MousePointer className="w-3.5 h-3.5" /> Manual Draw</>
                  : <><Wand2 className="w-3.5 h-3.5" /> Auto Detect</>
                }
              </button>
            ))}
          </div>

          {/* Hint banners */}
          {mode === "manual" && rects.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
              <strong>Click and drag</strong> on the image below to mark the watermark area, then click Remove.
            </div>
          )}
          {mode === "manual" && rects.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
              {rects.length} area{rects.length !== 1 ? "s" : ""} marked — click <strong>Remove</strong> to apply.
            </div>
          )}
          {mode === "auto" && rects.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
              {rects.length} bright region{rects.length !== 1 ? "s" : ""} detected — click <strong>Remove</strong> to apply.
            </div>
          )}

          {/* Image + overlay canvas */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {mode === "manual" ? "Draw over the watermark" : `${rects.length} region${rects.length !== 1 ? "s" : ""} detected`}
              </p>
              {rects.length > 0 && (
                <button onClick={() => setRects([])} className="text-xs text-destructive hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/*
              Display the original image with a transparent canvas overlay.
              The image uses w-full so it fills the container.
              The canvas is absolutely positioned over it — same CSS size.
              Canvas pixel dimensions are set to naturalWidth × naturalHeight
              in the useEffect, and we convert coords via scale factor.
            */}
            <div className="relative w-full" style={{ lineHeight: 0 }}>
              <img
                src={original}
                alt="original"
                className="w-full object-contain block"
                style={{ maxHeight: 460, display: "block" }}
              />
              <canvas
                ref={overlayRef}
                className="absolute inset-0"
                style={{
                  width: "100%",
                  height: "100%",
                  cursor: mode === "manual" ? "crosshair" : "default",
                  touchAction: "none",
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
              {error.includes("Manual") && (
                <button
                  onClick={() => { setMode("manual"); setError(""); }}
                  className="ml-2 underline font-semibold"
                >
                  Switch now →
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={removeWatermarks}
              disabled={rects.length === 0 || loading}
              className="gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />{progress || "Removing…"}</>
                : <><Wand2 className="w-4 h-4" />Remove Watermark{rects.length > 1 ? "s" : ""}</>
              }
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" /> New Image
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>
        </div>
      )}
    </div>
  );
}
