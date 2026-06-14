import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

const GRADIENTS = [
  { label: "Purple Dream",   value: "linear-gradient(135deg,#667eea,#764ba2)" },
  { label: "Sunset",         value: "linear-gradient(135deg,#f093fb,#f5576c)" },
  { label: "Ocean",          value: "linear-gradient(135deg,#4facfe,#00f2fe)" },
  { label: "Forest",         value: "linear-gradient(135deg,#43e97b,#38f9d7)" },
  { label: "Golden",         value: "linear-gradient(135deg,#fa8231,#f7b731)" },
  { label: "Midnight",       value: "linear-gradient(135deg,#1a1a2e,#16213e)" },
  { label: "Rose",           value: "linear-gradient(135deg,#ff6b9d,#c44dff)" },
  { label: "Slate",          value: "linear-gradient(135deg,#334155,#475569)" },
  { label: "Peach",          value: "linear-gradient(135deg,#ffecd2,#fcb69f)" },
  { label: "Lavender",       value: "linear-gradient(135deg,#a8edea,#fed6e3)" },
  { label: "Sky",            value: "linear-gradient(135deg,#e0c3fc,#8ec5fc)" },
  { label: "Mint",           value: "linear-gradient(135deg,#d4fc79,#96e6a1)" },
];

const ASPECT_OPTIONS = [
  { label: "Auto", value: "auto" },
  { label: "16:9", value: "16:9" },
  { label: "4:3",  value: "4:3" },
  { label: "1:1",  value: "1:1" },
];

export default function ScreenshotBeautifier() {
  useSEO({
    title: "Screenshot Beautifier — Beautiful Screenshot Frames Free | ToolsHub",
    description:
      "Make your screenshots beautiful instantly. Add gradient backgrounds, padding, shadows, and rounded corners. Download as PNG. 100% free, no upload.",
  });

  const { count, increment } = useToolCounter("screenshot-beautifier");

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [gradient, setGradient] = useState(GRADIENTS[0].value);
  const [padding, setPadding] = useState(48);
  const [radius, setRadius] = useState(12);
  const [shadow, setShadow] = useState(true);
  const [aspect, setAspect] = useState("auto");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const downloaded = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgW = image.naturalWidth;
    const imgH = image.naturalHeight;

    let canvasW: number;
    let canvasH: number;

    if (aspect === "auto") {
      canvasW = imgW + padding * 2;
      canvasH = imgH + padding * 2;
    } else {
      const [aw, ah] = aspect.split(":").map(Number);
      const innerW = imgW;
      const innerH = imgH;
      const ratio = aw / ah;
      const fitW = Math.max(innerW + padding * 2, Math.round((innerH + padding * 2) * ratio));
      const fitH = Math.round(fitW / ratio);
      canvasW = fitW;
      canvasH = fitH;
    }

    canvas.width = canvasW;
    canvas.height = canvasH;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
    const colorMatch = gradient.match(/#[0-9a-fA-F]{6}/g);
    if (colorMatch && colorMatch.length >= 2) {
      grad.addColorStop(0, colorMatch[0]);
      grad.addColorStop(1, colorMatch[1]);
    } else {
      grad.addColorStop(0, "#667eea");
      grad.addColorStop(1, "#764ba2");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Position image center
    const imgX = Math.round((canvasW - imgW) / 2);
    const imgY = Math.round((canvasH - imgH) / 2);

    // Shadow
    if (shadow) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 32;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, radius);
      ctx.fill();
      ctx.restore();
    }

    // Rounded image clip
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgW, imgH, radius);
    ctx.clip();
    ctx.drawImage(image, imgX, imgY, imgW, imgH);
    ctx.restore();
  }, [image, gradient, padding, radius, shadow, aspect]);

  useEffect(() => { draw(); }, [draw]);

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        downloaded.current = false;
        increment();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_beautiful.png");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "screenshot_beautiful.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Screenshot Beautifier</h1>
            <p className="text-sm text-muted-foreground">Sundar frame mein lagao — 100% free, no upload</p>
          </div>
        </div>
        <UsageCount count={count} />
      </div>

      {!image ? (
        /* Drop Zone */
        <div
          className={`dropzone-idle rounded-2xl p-12 text-center cursor-pointer ${dragging ? "dropzone-active" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Screenshot yahan drop karein</p>
              <p className="text-sm text-muted-foreground mt-1">ya click karein select karne ke liye</p>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP, GIF support</p>
            </div>
            <Button variant="outline" size="sm">
              <ImageIcon className="w-4 h-4 mr-2" />
              Screenshot Select Karein
            </Button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Controls */}
          <div className="space-y-5 order-2 lg:order-1">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-5">

              {/* Gradient picker */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2.5">Background</p>
                <div className="grid grid-cols-4 gap-2">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.value}
                      title={g.label}
                      onClick={() => setGradient(g.value)}
                      className={`h-9 rounded-lg border-2 transition-all ${
                        gradient === g.value ? "border-primary scale-110 shadow-md" : "border-transparent"
                      }`}
                      style={{ background: g.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2.5">Aspect Ratio</p>
                <div className="grid grid-cols-4 gap-2">
                  {ASPECT_OPTIONS.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => setAspect(a.value)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        aspect === a.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Padding */}
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Padding</p>
                  <span className="text-xs text-muted-foreground">{padding}px</span>
                </div>
                <input
                  type="range" min={16} max={120} step={8} value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Corner Radius */}
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Rounded Corners</p>
                  <span className="text-xs text-muted-foreground">{radius}px</span>
                </div>
                <input
                  type="range" min={0} max={32} step={2} value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Shadow toggle */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Drop Shadow</p>
                <button
                  onClick={() => setShadow((s) => !s)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${shadow ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${shadow ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <Button onClick={download} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  PNG Download Karein
                </Button>
                <Button
                  variant="outline" className="w-full gap-2"
                  onClick={() => { setImage(null); inputRef.current?.click(); }}
                >
                  <ImageIcon className="w-4 h-4" />
                  Nayi Image
                </Button>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="order-1 lg:order-2">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preview</p>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
              <div className="p-4 bg-muted/20 flex items-center justify-center min-h-[300px]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[480px] object-contain rounded-lg shadow-sm"
                  style={{ imageRendering: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
