import { useState, useRef, useCallback } from "react";
import { Upload, Copy, Check, Palette, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function toHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function colorDist(a: number[], b: number[]) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}

function extractPalette(img: HTMLImageElement, count = 8): { hex: string; rgb: [number,number,number] }[] {
  const SIZE = 120;
  const c = document.createElement("canvas");
  c.width = SIZE; c.height = SIZE;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

  // Quantize colors
  const map = new Map<string, { rgb: [number,number,number]; n: number }>();
  const STEP = 24;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = Math.round(data[i]   / STEP) * STEP;
    const g = Math.round(data[i+1] / STEP) * STEP;
    const b = Math.round(data[i+2] / STEP) * STEP;
    const key = `${r},${g},${b}`;
    const e = map.get(key);
    if (e) e.n++; else map.set(key, { rgb: [r, g, b], n: 1 });
  }

  // Sort by frequency
  const sorted = [...map.values()].sort((a, b) => b.n - a.n);

  // Pick diverse colors (min distance check)
  const palette: { hex: string; rgb: [number,number,number] }[] = [];
  for (const { rgb } of sorted) {
    if (palette.length >= count) break;
    const lum = luminance(...rgb);
    if (lum < 18 || lum > 238) continue; // skip near-black/white
    const tooClose = palette.some((p) => colorDist(p.rgb as number[], rgb) < 50);
    if (!tooClose) palette.push({ hex: toHex(...rgb), rgb });
  }

  // If not enough, add back without distance filter
  if (palette.length < 4) {
    for (const { rgb } of sorted) {
      if (palette.length >= count) break;
      const hex = toHex(...rgb);
      if (!palette.some((p) => p.hex === hex)) palette.push({ hex, rgb });
    }
  }

  return palette;
}

export default function ColorPalette() {
  useSEO({
    title: "Color Palette Extractor — Get Colors from Any Image | ToolsHub",
    description: "Extract dominant colors from any image. Get hex codes and RGB values instantly. Free, 100% in your browser.",
  });

  const { count, increment } = useToolCounter("color-palette");
  const inputRef = useRef<HTMLInputElement>(null);
  const [colors,    setColors]    = useState<{ hex: string; rgb: [number,number,number] }[]>([]);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [copied,    setCopied]    = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const palette = extractPalette(img, 8);
      setColors(palette);
      setPreview(url);
      setCopied(null);
      increment();
    };
    img.src = url;
  }, [increment]);

  const copyColor = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1800);
  };

  const copyAll = async () => {
    const text = colors.map((c) => c.hex).join(", ");
    await navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const downloadSwatch = () => {
    const W = 80, H = 120, GAP = 8;
    const total = colors.length;
    const c = document.createElement("canvas");
    c.width = total * (W + GAP) - GAP;
    c.height = H + 30;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, c.width, c.height);
    colors.forEach(({ hex, rgb }, i) => {
      const x = i * (W + GAP);
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.roundRect(x, 0, W, H, 10);
      ctx.fill();
      ctx.fillStyle = luminance(...rgb) > 128 ? "#000" : "#fff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(hex.toUpperCase(), x + W / 2, H + 20);
    });
    c.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "color-palette.png";
      a.click();
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Design Tools</span>
            <UsageCount count={count} label="extracted" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Color Palette Extractor</h1>
          <p className="text-muted-foreground mt-2">
            Upload any image — get its dominant colors as hex codes instantly.
          </p>
        </div>
        <ShareButton
          onCopy={async () => { await navigator.clipboard.writeText(window.location.href); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); }}
          copied={linkCopied} label="Share"
        />
      </div>

      {/* Drop zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors mb-8 ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
        }`}
      >
        {preview ? (
          <img src={preview} alt="uploaded" className="max-h-40 mx-auto rounded-xl object-contain mb-2" />
        ) : (
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        )}
        <p className="text-sm font-medium text-foreground">
          {preview ? "Click or drop to change image" : "Drop an image here"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF, SVG</p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
      </div>

      {/* Palette */}
      {colors.length > 0 && (
        <div className="space-y-6">
          {/* Big swatches row */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {colors.map(({ hex, rgb }) => (
              <button
                key={hex}
                onClick={() => copyColor(hex)}
                title={`Click to copy ${hex}`}
                className="group flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <div
                  className="w-full aspect-square rounded-xl shadow-md border border-black/10 relative overflow-hidden"
                  style={{ backgroundColor: hex }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                    {copied === hex
                      ? <Check className="w-5 h-5 text-white drop-shadow" />
                      : <Copy className="w-5 h-5 text-white drop-shadow" />
                    }
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-foreground uppercase">{hex}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{rgb.join(", ")}</span>
              </button>
            ))}
          </div>

          {/* Detail list */}
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {colors.map(({ hex, rgb }) => (
              <div key={hex} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-lg shrink-0 border border-black/10 shadow-sm" style={{ backgroundColor: hex }} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold text-foreground uppercase">{hex}</p>
                  <p className="text-xs text-muted-foreground font-mono">rgb({rgb.join(", ")})</p>
                </div>
                <button
                  onClick={() => copyColor(hex)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/8"
                >
                  {copied === hex ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === hex ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={copyAll} variant="secondary" className="gap-2">
              {allCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {allCopied ? "Copied All!" : "Copy All Hex Codes"}
            </Button>
            <Button onClick={downloadSwatch} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download Swatch PNG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
