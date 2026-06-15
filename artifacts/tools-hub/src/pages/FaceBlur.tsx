import { useState, useRef, useCallback, useEffect } from "react";
import { Download, EyeOff, Loader2, RefreshCw, MousePointer, Wand2 } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

interface FaceRect { x: number; y: number; w: number; h: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _detectionPipe: any = null;

function applyBoxBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  rect: FaceRect,
  radius: number,
  passes = 4,
): void {
  const x1 = Math.max(0, rect.x);
  const y1 = Math.max(0, rect.y);
  const x2 = Math.min(width - 1, rect.x + rect.w);
  const y2 = Math.min(height - 1, rect.y + rect.h);

  for (let pass = 0; pass < passes; pass++) {
    for (let py = y1; py <= y2; py++) {
      for (let px = x1; px <= x2; px++) {
        let r = 0, g = 0, b = 0, cnt = 0;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.max(x1, Math.min(x2, px + dx));
          const i = (py * width + nx) * 4;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; cnt++;
        }
        const i = (py * width + px) * 4;
        data[i] = r / cnt; data[i + 1] = g / cnt; data[i + 2] = b / cnt;
      }
    }
    for (let py = y1; py <= y2; py++) {
      for (let px = x1; px <= x2; px++) {
        let r = 0, g = 0, b = 0, cnt = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = Math.max(y1, Math.min(y2, py + dy));
          const i = (ny * width + px) * 4;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; cnt++;
        }
        const i = (py * width + px) * 4;
        data[i] = r / cnt; data[i + 1] = g / cnt; data[i + 2] = b / cnt;
      }
    }
  }
}

function detectFacesFallback(img: HTMLImageElement): FaceRect[] {
  const tmpCanvas = document.createElement("canvas");
  const scale = Math.min(1, 400 / Math.max(img.naturalWidth, img.naturalHeight));
  tmpCanvas.width = Math.round(img.naturalWidth * scale);
  tmpCanvas.height = Math.round(img.naturalHeight * scale);
  const ctx = tmpCanvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, tmpCanvas.width, tmpCanvas.height);
  const { data, width, height } = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
  const blockSize = 8;
  const skinBlocks: { bx: number; by: number }[] = [];

  for (let by = 0; by < height - blockSize; by += blockSize) {
    for (let bx = 0; bx < width - blockSize; bx += blockSize) {
      let skinCnt = 0;
      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const i = ((by + dy) * width + (bx + dx)) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (r > 95 && g > 40 && b > 20 && r > g && r > b &&
              Math.abs(r - g) > 15 && r - Math.min(g, b) > 15) {
            skinCnt++;
          }
        }
      }
      if (skinCnt > blockSize * blockSize * 0.5) skinBlocks.push({ bx, by });
    }
  }

  if (skinBlocks.length === 0) return [];
  const minX = Math.min(...skinBlocks.map((b) => b.bx));
  const minY = Math.min(...skinBlocks.map((b) => b.by));
  const maxX = Math.max(...skinBlocks.map((b) => b.bx)) + blockSize;
  const maxY = Math.max(...skinBlocks.map((b) => b.by)) + blockSize;
  return [{
    x: Math.round(minX / scale), y: Math.round(minY / scale),
    w: Math.round((maxX - minX) / scale), h: Math.round((maxY - minY) / scale),
  }];
}

export default function FaceBlur() {
  useSEO({
    title: "Free AI Face Blur — Auto Detect & Blur Faces | ToolsHub",
    description: "Automatically detect and blur all faces in any image. AI-powered, 100% private — runs in your browser, nothing uploaded.",
  });

  const { count, increment } = useToolCounter("face-blur");

  const [original, setOriginal]       = useState<string | null>(null);
  const [result, setResult]           = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [progress, setProgress]       = useState("");
  const [error, setError]             = useState("");
  const [fileName, setFileName]       = useState("");
  const [dragOver, setDragOver]       = useState(false);
  const [linkCopied, setLinkCopied]   = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(18);
  const [mode, setMode]               = useState<"auto" | "manual">("auto");
  const [faces, setFaces]             = useState<FaceRect[]>([]);
  const [currentRect, setCurrentRect] = useState<FaceRect | null>(null);

  const inputRef   = useRef<HTMLInputElement>(null);
  const imgRef     = useRef<HTMLImageElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const drawStart  = useRef<{ x: number; y: number } | null>(null);
  const isDrawing  = useRef(false);
  const currentFile = useRef<File | null>(null);

  // ── Re-draw the overlay whenever faces or currentRect changes ──
  useEffect(() => {
    const overlay = overlayRef.current;
    const img     = imgRef.current;
    if (!overlay || !img) return;

    // Sync canvas pixel dimensions to the image's natural size
    if (overlay.width !== img.naturalWidth)  overlay.width  = img.naturalWidth;
    if (overlay.height !== img.naturalHeight) overlay.height = img.naturalHeight;

    const ctx = overlay.getContext("2d")!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctx.strokeStyle = "rgba(99,102,241,0.9)";
    ctx.fillStyle   = "rgba(99,102,241,0.22)";
    ctx.lineWidth   = Math.max(2, img.naturalWidth / 300);

    for (const r of faces) {
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    if (currentRect) {
      ctx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
    }
  }, [faces, currentRect, original]); // include `original` so it runs after img loads

  // ── Canvas coordinate conversion ──
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current!;
    const rect   = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width  / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height),
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "manual") return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    drawStart.current = { x, y };
    isDrawing.current = true;
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !drawStart.current) return;
    const { x, y } = getCanvasCoords(e);
    const sx = drawStart.current.x, sy = drawStart.current.y;
    setCurrentRect({ x: Math.min(sx, x), y: Math.min(sy, y), w: Math.abs(x - sx), h: Math.abs(y - sy) });
  };
  const onMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentRect && currentRect.w > 8 && currentRect.h > 8) {
      setFaces((prev) => [...prev, currentRect]);
    }
    setCurrentRect(null);
    drawStart.current = null;
  };

  // ── Apply blur to the canvas and produce output blob ──
  const applyBlurToFaces = useCallback(async (img: HTMLImageElement, faceRects: FaceRect[], intensity: number) => {
    setProgress("Blurring faces…");
    await new Promise((r) => setTimeout(r, 20));

    const canvas = document.createElement("canvas");
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (const face of faceRects) {
      const pad = Math.round(Math.min(face.w, face.h) * 0.08);
      applyBoxBlur(imgData.data, canvas.width, canvas.height, {
        x: Math.max(0, face.x - pad),
        y: Math.max(0, face.y - pad),
        w: Math.min(canvas.width  - face.x + pad, face.w + pad * 2),
        h: Math.min(canvas.height - face.y + pad, face.h + pad * 2),
      }, intensity, 4);
    }

    ctx.putImageData(imgData, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) { setError("Failed to generate result."); setLoading(false); return; }
      setResult(URL.createObjectURL(blob));
      increment();
      setLoading(false);
      setProgress("");
    }, "image/jpeg", 0.95);
  }, [increment]);

  // ── Auto-detect via HuggingFace with skin-tone fallback ──
  const autoDetectFaces = useCallback(async (img: HTMLImageElement, file: File, intensity: number) => {
    try {
      const { pipeline, env } = await import("@huggingface/transformers");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (env.backends.onnx as any).wasm.numThreads = 1;

      if (!_detectionPipe) {
        setProgress("Downloading face detection model (~10 MB, first time only)…");
        _detectionPipe = await pipeline(
          "object-detection",
          "Xenova/yolov9-c-sharpenss-face-detection",
          {
            device: "wasm",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            progress_callback: (p: any) => {
              if ((p.status === "progress" || p.status === "download") && p.total > 0)
                setProgress(`Downloading model: ${Math.round((p.loaded / p.total) * 100)}%`);
            },
          }
        ).catch(() => null);
      }

      let rects: FaceRect[] = [];
      if (_detectionPipe) {
        setProgress("Detecting faces…");
        const url = URL.createObjectURL(file);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dets: any[] = await (_detectionPipe as any)(url, { threshold: 0.35 });
        URL.revokeObjectURL(url);
        rects = dets
          .filter((d: any) => d.label === "face" || d.score > 0.35)
          .map((d: any) => ({
            x: Math.round(d.box.xmin), y: Math.round(d.box.ymin),
            w: Math.round(d.box.xmax - d.box.xmin), h: Math.round(d.box.ymax - d.box.ymin),
          }));
      }

      if (rects.length === 0) rects = detectFacesFallback(img);

      setFaces(rects);
      if (rects.length > 0) {
        await applyBlurToFaces(img, rects, intensity);
      } else {
        setError("No faces detected. Switch to Manual mode to draw blur areas yourself.");
        setLoading(false); setProgress("");
      }
    } catch {
      _detectionPipe = null;
      const rects = detectFacesFallback(img);
      setFaces(rects);
      if (rects.length > 0) {
        await applyBlurToFaces(img, rects, intensity);
      } else {
        setError("No faces detected. Switch to Manual mode to draw blur areas yourself.");
        setLoading(false); setProgress("");
      }
    }
  }, [applyBlurToFaces]);

  // ── Load file ──
  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Only image files are supported."); return; }
    setError(""); setResult(null); setFaces([]); setCurrentRect(null);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_blurred.jpg");
    currentFile.current = file;
    const url = URL.createObjectURL(file);
    setOriginal(url);
    setLoading(true); setProgress("Loading image…");

    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
      });
      imgRef.current = img;

      if (mode === "auto") {
        await autoDetectFaces(img, file, blurIntensity);
      } else {
        setLoading(false); setProgress("");
      }
    } catch (e: any) {
      setError("Failed to load image. " + (e?.message?.slice(0, 100) ?? ""));
      setLoading(false); setProgress("");
    }
  }, [mode, blurIntensity, autoDetectFaces]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const f = Array.from(files)[0]; if (f) processFile(f);
  }, [processFile]);

  const applyManualBlur = async () => {
    if (!imgRef.current || faces.length === 0) return;
    setLoading(true);
    await applyBlurToFaces(imgRef.current, faces, blurIntensity);
  };

  const reset = () => {
    setOriginal(null); setResult(null); setError("");
    setFaces([]); setCurrentRect(null);
    imgRef.current = null; currentFile.current = null;
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result; a.download = fileName || "face_blurred.jpg"; a.click();
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
              <EyeOff className="w-3.5 h-3.5" /><span>Image Tools</span>
              <UsageCount count={count} label="faces blurred" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Face Blur</h1>
            <p className="text-muted-foreground mt-2">
              Auto-detect and blur every face in any photo. Or draw your own areas. Browser only — nothing uploaded.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      <div className="mb-5 flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <EyeOff className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <span><strong>Privacy focused.</strong> No face data or image leaves your browser. Everything runs locally.</span>
      </div>

      {/* ── Upload state ── */}
      {!original && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Detection mode</p>
              <div className="flex gap-2">
                {(["auto", "manual"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      mode === m ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {m === "auto" ? <><Wand2 className="w-3.5 h-3.5" /> Auto</> : <><MousePointer className="w-3.5 h-3.5" /> Manual</>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Blur intensity: <span className="text-foreground font-semibold">{blurIntensity}</span>
              </p>
              <input type="range" min={4} max={40} value={blurIntensity}
                onChange={(e) => setBlurIntensity(Number(e.target.value))}
                className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>Subtle</span><span>Strong</span>
              </div>
            </div>
          </div>
          <ImageDropZone
            dragOver={dragOver}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            title="Drop a photo to blur faces"
            subtitle={mode === "auto" ? "AI will automatically detect all faces" : "You'll draw over the areas to blur"}
            badges={["JPG", "PNG", "WebP"]}
            buttonLabel="Select Photo"
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </ImageDropZone>
        </>
      )}

      {/* ── Result state ── */}
      {original && result && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original</p>
              </div>
              <div className="p-3 bg-muted/20 flex items-center justify-center min-h-[180px]">
                <img src={original} alt="original" className="max-h-[260px] max-w-full rounded-lg object-contain" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Faces Blurred</p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ {faces.length} face{faces.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="p-3 bg-muted/20 flex items-center justify-center min-h-[180px]">
                <img src={result} alt="result" className="max-h-[260px] max-w-full rounded-lg object-contain" />
              </div>
            </div>
          </div>

          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>}

          <div className="flex flex-wrap gap-3">
            <Button onClick={download} className="gap-2">
              <Download className="w-4 h-4" /> Download Image
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" /> New Photo
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Missed a face? Click New Photo, switch to Manual mode, and draw over any remaining areas.
          </div>
        </div>
      )}

      {/* ── Processing / manual drawing state ── */}
      {original && !result && (
        <div className="space-y-5">
          {/* Loading spinner */}
          {loading && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Processing…</p>
              </div>
              <div className="p-6 flex items-center justify-center min-h-[200px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">{progress}</p>
                </div>
              </div>
            </div>
          )}

          {/* Manual drawing canvas */}
          {!loading && mode === "manual" && (
            <>
              {faces.length > 0 ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
                  {faces.length} area{faces.length !== 1 ? "s" : ""} marked — click <strong>Apply Blur</strong> when ready.
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
                  <strong>Draw rectangles</strong> over the faces you want to blur.
                </div>
              )}

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Click &amp; drag to mark areas
                  </p>
                  {faces.length > 0 && (
                    <button onClick={() => setFaces([])} className="text-xs text-destructive hover:underline">
                      Clear all
                    </button>
                  )}
                </div>
                {/* The container uses position:relative so the canvas sits exactly over the image */}
                <div className="relative w-full" style={{ lineHeight: 0 }}>
                  <img
                    src={original}
                    alt="original"
                    className="w-full object-contain block"
                    style={{ maxHeight: 440, display: "block" }}
                  />
                  <canvas
                    ref={overlayRef}
                    className="absolute inset-0"
                    style={{
                      width: "100%",
                      height: "100%",
                      cursor: "crosshair",
                      touchAction: "none",
                    }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                  />
                </div>
              </div>

              {/* Blur intensity control */}
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Blur intensity: <span className="text-foreground font-semibold">{blurIntensity}</span>
                </p>
                <input type="range" min={4} max={40} value={blurIntensity}
                  onChange={(e) => setBlurIntensity(Number(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                  <span>Subtle</span><span>Strong</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={applyManualBlur} disabled={faces.length === 0} className="gap-2">
                  <EyeOff className="w-4 h-4" /> Apply Blur
                </Button>
                <Button variant="outline" onClick={reset} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> New Photo
                </Button>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
              {error.includes("Manual") && (
                <button
                  onClick={() => { setError(""); setMode("manual"); }}
                  className="ml-2 underline font-semibold"
                >
                  Switch now →
                </button>
              )}
            </div>
          )}

          {/* Show "switch to manual" button if auto failed without loading */}
          {!loading && mode === "auto" && error && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => { setError(""); setMode("manual"); }} className="gap-2">
                <MousePointer className="w-4 h-4" /> Switch to Manual Mode
              </Button>
              <Button variant="outline" onClick={reset} className="gap-2">
                <RefreshCw className="w-4 h-4" /> New Photo
              </Button>
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)} />
    </div>
  );
}
