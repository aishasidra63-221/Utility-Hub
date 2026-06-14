import { useState, useRef, useEffect, useCallback } from "react";
import { Download, Sparkles, X, RefreshCw } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

const GRADIENTS = [
  { label: "Purple Dream",  value: "135deg,#667eea,#764ba2" },
  { label: "Sunset",        value: "135deg,#f093fb,#f5576c" },
  { label: "Ocean",         value: "135deg,#4facfe,#00f2fe" },
  { label: "Forest",        value: "135deg,#43e97b,#38f9d7" },
  { label: "Golden",        value: "135deg,#fa8231,#f7b731" },
  { label: "Midnight",      value: "135deg,#1a1a2e,#16213e" },
  { label: "Rose",          value: "135deg,#ff6b9d,#c44dff" },
  { label: "Slate",         value: "135deg,#334155,#475569" },
  { label: "Peach",         value: "135deg,#ffecd2,#fcb69f" },
  { label: "Lavender",      value: "135deg,#a8edea,#fed6e3" },
  { label: "Sky",           value: "135deg,#e0c3fc,#8ec5fc" },
  { label: "Mint",          value: "135deg,#d4fc79,#96e6a1" },
];

export default function ScreenshotBeautifier() {
  useSEO({
    title: "Screenshot Beautifier — Beautiful Screenshot Frames Free | ToolsHub",
    description:
      "Add gorgeous gradient backgrounds, padding, shadows, and rounded corners to your screenshots. Download as PNG. 100% free, no upload.",
  });

  const { count, increment } = useToolCounter("screenshot-beautifier");

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [gradient, setGradient] = useState(GRADIENTS[0].value);
  const [padding, setPadding] = useState(48);
  const [radius, setRadius] = useState(12);
  const [shadow, setShadow] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgW = image.naturalWidth;
    const imgH = image.naturalHeight;
    const canvasW = imgW + padding * 2;
    const canvasH = imgH + padding * 2;

    canvas.width = canvasW;
    canvas.height = canvasH;

    // Background gradient
    const colors = gradient.split(",");
    const angle = parseInt(colors[0]) || 135;
    const rad = (angle * Math.PI) / 180;
    const gx1 = canvasW / 2 - (Math.cos(rad) * canvasW) / 2;
    const gy1 = canvasH / 2 - (Math.sin(rad) * canvasH) / 2;
    const gx2 = canvasW / 2 + (Math.cos(rad) * canvasW) / 2;
    const gy2 = canvasH / 2 + (Math.sin(rad) * canvasH) / 2;
    const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
    grad.addColorStop(0, colors[1] || "#667eea");
    grad.addColorStop(1, colors[2] || "#764ba2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);

    const imgX = Math.round((canvasW - imgW) / 2);
    const imgY = Math.round((canvasH - imgH) / 2);

    // Shadow
    if (shadow) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 36;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      if (radius > 0) {
        ctx.roundRect(imgX, imgY, imgW, imgH, radius);
      } else {
        ctx.rect(imgX, imgY, imgW, imgH);
      }
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.restore();
    }

    // Clip + draw image
    ctx.save();
    ctx.beginPath();
    if (radius > 0) {
      ctx.roundRect(imgX, imgY, imgW, imgH, radius);
    } else {
      ctx.rect(imgX, imgY, imgW, imgH);
    }
    ctx.clip();
    ctx.drawImage(image, imgX, imgY, imgW, imgH);
    ctx.restore();
  }, [image, gradient, padding, radius, shadow]);

  useEffect(() => { draw(); }, [draw]);

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { setImage(img); increment(); };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_beautiful.png");
  };

  const handleFiles = (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (file) loadFile(file);
  };

  const download = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "screenshot_beautiful.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="beautified" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Screenshot Beautifier</h1>
            <p className="text-muted-foreground mt-2">
              Drop a screenshot, pick a gradient, and download a stunning framed image. Perfect for sharing on social media.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      {!image ? (
        <ImageDropZone
          dragOver={dragOver}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          title="Drop your screenshot here"
          subtitle="Works great with app screenshots, code snippets, and UI designs"
          badges={["JPG", "PNG", "WebP", "GIF"]}
          buttonLabel="Select Screenshot"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </ImageDropZone>
      ) : (
        <div className="space-y-5">
          {/* Controls */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-5">

            {/* Gradient */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Background</p>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.value}
                    title={g.label}
                    onClick={() => setGradient(g.value)}
                    className={`h-8 rounded-lg border-2 transition-all ${
                      gradient === g.value ? "border-primary scale-110 shadow-md" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ background: `linear-gradient(${g.value})` }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Padding */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Padding</label>
                  <span className="text-sm font-mono font-semibold text-primary">{padding}px</span>
                </div>
                <input type="range" min={16} max={120} step={8} value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Tight</span><span>Spacious</span>
                </div>
              </div>

              {/* Corner Radius */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Corner Radius</label>
                  <span className="text-sm font-mono font-semibold text-primary">{radius}px</span>
                </div>
                <input type="range" min={0} max={32} step={2} value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Square</span><span>Rounded</span>
                </div>
              </div>
            </div>

            {/* Shadow toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Drop Shadow</label>
              <button
                onClick={() => setShadow((s) => !s)}
                className={`relative w-10 h-5 rounded-full transition-colors ${shadow ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${shadow ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preview</p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
            </div>
            <div className="p-4 bg-muted/20 flex items-center justify-center">
              <canvas ref={canvasRef}
                className="max-w-full max-h-[400px] rounded-lg shadow-sm object-contain" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={download} className="gap-2">
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
            <Button variant="outline" onClick={() => setImage(null)} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              New Screenshot
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>
        </div>
      )}
    </div>
  );
}
