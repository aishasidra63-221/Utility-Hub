import { useState, useRef, useCallback, useEffect } from "react";
import { Pipette, Copy, Check, Upload, RefreshCw } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function componentToHex(c: number) {
  return c.toString(16).padStart(2, "0");
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

interface PickedColor {
  hex: string;
  r: number; g: number; b: number;
  h: number; s: number; l: number;
  x: number; y: number;
}

const PALETTE_COLORS = [
  "#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e",
  "#10b981","#14b8a6","#06b6d4","#3b82f6","#6366f1","#8b5cf6",
  "#a855f7","#d946ef","#ec4899","#f43f5e","#ffffff","#e5e7eb",
  "#9ca3af","#6b7280","#374151","#1f2937","#111827","#000000",
];

export default function ColorPicker() {
  useSEO({
    title: "Color Picker — Pick Colors from Images, HEX RGB HSL | ToolsHub",
    description:
      "Pick any color from an image or the color wheel. Get HEX, RGB, and HSL values instantly. Free, browser-based color picker tool.",
  });

  const { count, increment } = useToolCounter("color-picker");

  const [image, setImage] = useState<string | null>(null);
  const [picked, setPicked] = useState<PickedColor | null>(null);
  const [history, setHistory] = useState<PickedColor[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [zoom, setZoom] = useState<{ x: number; y: number; color: string } | null>(null);
  const [eyedropperSupported] = useState(() => "EyeDropper" in window);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImage(url);
      setPicked(null);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
    };
    img.src = url;
  }, []);

  const handleFiles = (files: FileList | File[]) => {
    const f = Array.from(files)[0];
    if (f) loadFile(f);
  };

  const pickFromCanvas = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = Math.round((e.clientX - rect.left) * scaleX);
    const py = Math.round((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext("2d")!;
    const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const color: PickedColor = { hex, r, g, b, ...hsl, x: px, y: py };
    setPicked(color);
    setHistory((prev) => [color, ...prev.slice(0, 19)]);
    increment();
  }, [increment]);

  const moveOnCanvas = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = Math.round((e.clientX - rect.left) * scaleX);
    const py = Math.round((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext("2d")!;
    const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
    const hex = rgbToHex(r, g, b);
    setZoom({ x: e.clientX - rect.left, y: e.clientY - rect.top, color: hex });
  }, []);

  const useEyeDropper = async () => {
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const hex = result.sRGBHex;
      const { r, g, b } = hexToRgb(hex);
      const hsl = rgbToHsl(r, g, b);
      const color: PickedColor = { hex, r, g, b, ...hsl, x: 0, y: 0 };
      setPicked(color);
      setHistory((prev) => [color, ...prev.slice(0, 19)]);
      increment();
    } catch { /* cancelled */ }
  };

  const copyValue = async (key: string, val: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const pickFromPalette = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    const color: PickedColor = { hex, r, g, b, ...hsl, x: 0, y: 0 };
    setPicked(color);
    setHistory((prev) => [color, ...prev.slice(0, 19)]);
    increment();
  };

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const colorFormats = picked ? [
    { key: "hex", label: "HEX", value: picked.hex.toUpperCase() },
    { key: "rgb", label: "RGB", value: `rgb(${picked.r}, ${picked.g}, ${picked.b})` },
    { key: "hsl", label: "HSL", value: `hsl(${picked.h}, ${picked.s}%, ${picked.l}%)` },
    { key: "r", label: "R", value: String(picked.r) },
    { key: "g", label: "G", value: String(picked.g) },
    { key: "b", label: "B", value: String(picked.b) },
  ] : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <Pipette className="w-3.5 h-3.5" />
              <span>Utility Tools</span>
              <UsageCount count={count} label="colors picked" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Color Picker</h1>
            <p className="text-muted-foreground mt-2">
              Click anywhere on an image to pick its exact color. Get HEX, RGB, and HSL values instantly.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      <div className="space-y-5">
        {/* Eyedropper + quick palette */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {eyedropperSupported && (
              <Button onClick={useEyeDropper} variant="outline" className="gap-2">
                <Pipette className="w-4 h-4" />
                Pick from Screen
              </Button>
            )}
            <Button variant="outline" onClick={() => inputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" />
              Pick from Image
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>

          {/* Quick palette */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick palette</p>
            <div className="flex flex-wrap gap-1.5">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => pickFromPalette(c)}
                  title={c}
                  className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${
                    picked?.hex.toLowerCase() === c.toLowerCase()
                      ? "border-primary shadow-md scale-110"
                      : "border-border"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Picked color display */}
        {picked && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="h-20 w-full" style={{ background: picked.hex }} />
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {colorFormats.map(({ key, label, value }) => (
                  <button
                    key={key}
                    onClick={() => copyValue(key, value)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{label}</p>
                      <p className="text-xs font-mono font-semibold text-foreground">{value}</p>
                    </div>
                    {copiedKey === key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image canvas */}
        {!image ? (
          <ImageDropZone
            dragOver={dragOver}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            title="Drop an image to pick colors from it"
            subtitle="Click anywhere on the image to pick that color"
            badges={["JPG", "PNG", "WebP", "GIF"]}
            buttonLabel="Select Image"
          />
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Click anywhere to pick a color
              </p>
              <Button variant="ghost" size="sm" onClick={() => { setImage(null); setPicked(null); }}
                className="h-7 gap-1.5 text-xs">
                <RefreshCw className="w-3 h-3" />
                New image
              </Button>
            </div>
            <div className="relative overflow-auto max-h-[500px] p-2 bg-muted/20">
              <canvas
                ref={canvasRef}
                onClick={pickFromCanvas}
                onMouseMove={moveOnCanvas}
                onMouseLeave={() => setZoom(null)}
                className="max-w-full cursor-crosshair rounded-lg"
                style={{ display: "block", margin: "0 auto" }}
              />
              {/* Zoom tooltip */}
              {zoom && (
                <div
                  className="pointer-events-none absolute z-10 flex flex-col items-center gap-1"
                  style={{ left: zoom.x + 16, top: zoom.y + 16 }}
                >
                  <div className="w-10 h-10 rounded-full border-4 border-white shadow-xl"
                    style={{ background: zoom.color }} />
                  <span className="text-[10px] font-mono font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                    {zoom.color.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Picked colors ({history.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {history.map((c, i) => (
                <button
                  key={i}
                  onClick={() => { setPicked(c); copyValue("hex", c.hex.toUpperCase()); }}
                  title={c.hex.toUpperCase()}
                  className="group relative w-8 h-8 rounded-lg border-2 border-border hover:border-primary/60 hover:scale-110 transition-all shadow-sm"
                  style={{ background: c.hex }}
                >
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {c.hex.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
