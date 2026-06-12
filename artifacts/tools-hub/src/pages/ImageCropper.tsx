import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, X, ImageIcon, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

const HANDLE_RADIUS = 7;
const MIN_SIZE = 20;

const ASPECT_PRESETS = [
  { label: "Free",  value: null     },
  { label: "1:1",   value: 1        },
  { label: "4:3",   value: 4 / 3   },
  { label: "16:9",  value: 16 / 9  },
  { label: "3:4",   value: 3 / 4   },
  { label: "9:16",  value: 9 / 16  },
];

type Handle = "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";
interface Box { x: number; y: number; w: number; h: number }

function getHandles(b: Box) {
  return [
    { id: "nw" as Handle, hx: b.x,           hy: b.y           },
    { id: "ne" as Handle, hx: b.x + b.w,     hy: b.y           },
    { id: "sw" as Handle, hx: b.x,           hy: b.y + b.h     },
    { id: "se" as Handle, hx: b.x + b.w,     hy: b.y + b.h     },
    { id: "n"  as Handle, hx: b.x + b.w / 2, hy: b.y           },
    { id: "s"  as Handle, hx: b.x + b.w / 2, hy: b.y + b.h     },
    { id: "w"  as Handle, hx: b.x,           hy: b.y + b.h / 2 },
    { id: "e"  as Handle, hx: b.x + b.w,     hy: b.y + b.h / 2 },
  ];
}

function hitTest(px: number, py: number, b: Box): Handle | null {
  for (const { id, hx, hy } of getHandles(b)) {
    if (Math.hypot(px - hx, py - hy) <= HANDLE_RADIUS + 5) return id;
  }
  if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return "move";
  return null;
}

function clamp(b: Box, cw: number, ch: number): Box {
  let { x, y, w, h } = b;
  w = Math.max(MIN_SIZE, w);
  h = Math.max(MIN_SIZE, h);
  x = Math.max(0, Math.min(cw - w, x));
  y = Math.max(0, Math.min(ch - h, y));
  w = Math.min(cw - x, w);
  h = Math.min(ch - y, h);
  return { x, y, w, h };
}

function drawCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  b: Box,
  cw: number,
  ch: number,
  scale: { sx: number; sy: number; ox: number; oy: number },
) {
  const { sx, sy, ox, oy } = scale;
  ctx.clearRect(0, 0, cw, ch);

  // Full image dim
  ctx.drawImage(img, ox, oy, img.naturalWidth * sx, img.naturalHeight * sy);
  ctx.fillStyle = "rgba(0,0,0,0.52)";
  ctx.fillRect(0, 0, cw, ch);

  // Clear crop area (bright)
  ctx.clearRect(b.x, b.y, b.w, b.h);
  ctx.drawImage(
    img,
    (b.x - ox) / sx, (b.y - oy) / sy, b.w / sx, b.h / sy,
    b.x, b.y, b.w, b.h,
  );

  // Border
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(b.x + 0.75, b.y + 0.75, b.w - 1.5, b.h - 1.5);

  // Rule-of-thirds grid
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 0.8;
  for (let i = 1; i < 3; i++) {
    const gx = b.x + (b.w / 3) * i;
    const gy = b.y + (b.h / 3) * i;
    ctx.beginPath(); ctx.moveTo(gx, b.y); ctx.lineTo(gx, b.y + b.h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x, gy); ctx.lineTo(b.x + b.w, gy); ctx.stroke();
  }

  // Handles
  for (const { hx, hy } of getHandles(b)) {
    ctx.beginPath();
    ctx.arc(hx, hy, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "hsl(252,90%,62%)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export default function ImageCropper() {
  useSEO({
    title: "Free Image Cropper — Crop JPG, PNG, WebP Online | ToolsHub",
    description: "Crop images online for free. Drag to select any area, choose aspect ratio, download instantly. No upload, 100% in your browser.",
  });

  const { count, increment } = useToolCounter("image-cropper");
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const imgRef     = useRef<HTMLImageElement | null>(null);
  const fileRef    = useRef<File | null>(null);
  const scaleRef   = useRef({ sx: 1, sy: 1, ox: 0, oy: 0 });
  const cropRef    = useRef<Box>({ x: 0, y: 0, w: 0, h: 0 });
  const dragRef    = useRef<{ type: Handle; sx: number; sy: number; sc: Box } | null>(null);
  const arRef      = useRef<number | null>(null);
  const sizeRef    = useRef({ cw: 0, ch: 0 });

  const [loaded,     setLoaded]     = useState(false);
  const [cropDisplay, setCropDisplay] = useState<Box>({ x:0,y:0,w:0,h:0 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    drawCanvas(ctx, img, cropRef.current, sizeRef.current.cw, sizeRef.current.ch, scaleRef.current);
    setCropDisplay({ ...cropRef.current });
  }, []);

  const canvasXY = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const sx     = canvas.width  / rect.width;
    const sy     = canvas.height / rect.height;
    const src    = "touches" in e
      ? (e.touches[0] ?? (e as TouchEvent).changedTouches[0])
      : (e as MouseEvent);
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  };

  const loadImage = useCallback((file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) return;
    fileRef.current = file;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      URL.revokeObjectURL(url);

      const wrap = wrapRef.current!;
      const maxW = wrap.clientWidth || 640;
      const maxH = Math.min(520, maxW * 0.7);
      const s    = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const cw   = Math.round(img.naturalWidth  * s);
      const ch   = Math.round(img.naturalHeight * s);

      const canvas = canvasRef.current!;
      canvas.width  = cw;
      canvas.height = ch;
      sizeRef.current  = { cw, ch };
      scaleRef.current = { sx: s, sy: s, ox: 0, oy: 0 };

      const m  = 0.1;
      const bx = Math.round(cw * m);
      const by = Math.round(ch * m);
      const bw = Math.round(cw * (1 - 2 * m));
      const bh = Math.round(ch * (1 - 2 * m));
      cropRef.current = { x: bx, y: by, w: bw, h: bh };
      arRef.current   = null;
      setAspectRatio(null);
      setLoaded(true);
      requestAnimationFrame(redraw);
    };
    img.src = url;
  }, [redraw]);

  useEffect(() => {
    if (loaded) redraw();
  }, [loaded, redraw]);

  const onPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = canvasXY(e);
    const type = hitTest(x, y, cropRef.current);
    if (!type) return;
    dragRef.current = { type, sx: x, sy: y, sc: { ...cropRef.current } };
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const { x: px, y: py } = canvasXY(e);
    const dx = px - dragRef.current.sx;
    const dy = py - dragRef.current.sy;
    const sc = dragRef.current.sc;
    const { cw, ch } = sizeRef.current;
    const ar = arRef.current;

    let nb = { ...sc };

    if (dragRef.current.type === "move") {
      nb.x = sc.x + dx;
      nb.y = sc.y + dy;
    } else {
      const t = dragRef.current.type;
      if (t.includes("e")) nb.w = Math.max(MIN_SIZE, sc.w + dx);
      if (t.includes("s")) nb.h = Math.max(MIN_SIZE, sc.h + dy);
      if (t.includes("w")) { nb.x = sc.x + dx; nb.w = Math.max(MIN_SIZE, sc.w - dx); }
      if (t.includes("n")) { nb.y = sc.y + dy; nb.h = Math.max(MIN_SIZE, sc.h - dy); }

      if (ar) {
        if (t === "n" || t === "s") nb.w = nb.h * ar;
        else if (t === "e" || t === "w") nb.h = nb.w / ar;
        else nb.h = nb.w / ar;
      }
    }

    cropRef.current = clamp(nb, cw, ch);
    requestAnimationFrame(redraw);
  }, [redraw]);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  const applyAspectRatio = useCallback((ratio: number | null) => {
    arRef.current = ratio;
    setAspectRatio(ratio);
    if (ratio && imgRef.current) {
      const b  = cropRef.current;
      const nh = b.w / ratio;
      cropRef.current = clamp({ ...b, h: nh }, sizeRef.current.cw, sizeRef.current.ch);
      requestAnimationFrame(redraw);
    }
  }, [redraw]);

  const download = useCallback(() => {
    const img  = imgRef.current;
    const file = fileRef.current;
    if (!img) return;
    const { sx, sy, ox, oy } = scaleRef.current;
    const { x, y, w, h }     = cropRef.current;
    const ix = (x - ox) / sx, iy = (y - oy) / sy;
    const iw = w / sx,        ih = h / sy;

    const out = document.createElement("canvas");
    out.width  = Math.round(iw);
    out.height = Math.round(ih);
    out.getContext("2d")!.drawImage(img, ix, iy, iw, ih, 0, 0, iw, ih);

    const ext  = file?.name.split(".").pop() ?? "jpg";
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    const base = file?.name.replace(/\.[^.]+$/, "") ?? "image";

    out.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${base}-cropped.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
      increment();
    }, mime, 0.93);
  }, [increment]);

  const reset = () => {
    setLoaded(false);
    imgRef.current  = null;
    fileRef.current = null;
  };

  const imgW = loaded ? Math.round(cropDisplay.w / scaleRef.current.sx) : 0;
  const imgH = loaded ? Math.round(cropDisplay.h / scaleRef.current.sy) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="crop" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Image Cropper</h1>
            <p className="text-muted-foreground mt-2">
              Upload, drag to select your area, download. JPG, PNG, WebP — 100% in your browser.
            </p>
          </div>
          <ShareButton
            onCopy={async () => {
              await navigator.clipboard.writeText(window.location.href);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2500);
            }}
            copied={linkCopied}
            label="Share this tool"
          />
        </div>
      </div>

      {/* Drop zone */}
      {!loaded ? (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) loadImage(f);
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Drop an image here to crop</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Aspect ratio selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground">Ratio:</span>
            {ASPECT_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyAspectRatio(p.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  aspectRatio === p.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div ref={wrapRef} className="rounded-xl overflow-hidden border border-border bg-black/10 select-none">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block touch-none"
              style={{ cursor: "crosshair" }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            />
          </div>

          {/* Crop size info */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Move className="w-3 h-3" />
            <span>
              Crop size: <span className="font-mono font-semibold text-foreground">{imgW} × {imgH} px</span>
              &nbsp;·&nbsp; Drag handles to resize · Drag inside to move
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button onClick={download}>
              <Download className="w-4 h-4 mr-2" />
              Download Cropped Image
            </Button>
            <Button variant="ghost" onClick={reset}>
              <X className="w-4 h-4 mr-2" />
              New Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
