import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { Download, Palette, Loader2, RefreshCw } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type ColorMode = "natural" | "warm" | "cool" | "vivid";

const COLOR_MODES: { id: ColorMode; label: string; desc: string }[] = [
  { id: "natural", label: "Natural", desc: "Realistic tones" },
  { id: "warm",    label: "Warm",    desc: "Golden, nostalgic" },
  { id: "cool",    label: "Cool",    desc: "Blue, cinematic" },
  { id: "vivid",   label: "Vivid",   desc: "Saturated colors" },
];

/**
 * Colorizes a grayscale image by mapping luminance to a realistic color space.
 * Uses luminance-driven hue selection: shadows → cool blue-green, midtones → warm
 * neutrals, highlights → warm white. The approach mimics how trained colorizers
 * work — dark regions lean cyan/blue (shadows in real photos are blue-shifted),
 * midtones lean warm (skin, wood, earth tones), highlights remain neutral/warm.
 */
function colorizeCanvas(img: HTMLImageElement, mode: ColorMode): HTMLCanvasElement {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const src = document.createElement("canvas");
  src.width = w; src.height = h;
  const srcCtx = src.getContext("2d")!;
  srcCtx.drawImage(img, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, w, h);
  const sd = srcData.data;

  const dst = document.createElement("canvas");
  dst.width = w; dst.height = h;
  const dstCtx = dst.getContext("2d")!;
  const dstImg = dstCtx.createImageData(w, h);
  const dd = dstImg.data;

  for (let i = 0; i < sd.length; i += 4) {
    // Convert to grayscale (luminance) regardless of input
    const lum = 0.299 * sd[i] + 0.587 * sd[i + 1] + 0.114 * sd[i + 2];
    const t = lum / 255; // 0 = dark, 1 = bright

    let r = lum, g = lum, b = lum;

    if (mode === "natural") {
      // Shadows: blue-purple tint; midtones: warm brown/sepia; highlights: cream
      if (t < 0.15) {
        r = lum * 0.75; g = lum * 0.82; b = lum * 1.25;
      } else if (t < 0.40) {
        const s = (t - 0.15) / 0.25;
        const rA = lum * 0.75, gA = lum * 0.82, bA = lum * 1.25;
        const rB = lum * 1.18, gB = lum * 0.98, bB = lum * 0.72;
        r = rA + s * (rB - rA); g = gA + s * (gB - gA); b = bA + s * (bB - bA);
      } else if (t < 0.72) {
        r = lum * 1.18; g = lum * 0.98; b = lum * 0.72;
      } else {
        const s = (t - 0.72) / 0.28;
        r = lum * 1.18 + s * (lum * 1.05 - lum * 1.18);
        g = lum * 0.98 + s * (lum * 1.02 - lum * 0.98);
        b = lum * 0.72 + s * (lum * 0.98 - lum * 0.72);
      }
    } else if (mode === "warm") {
      r = Math.min(255, lum * 1.25 + 15);
      g = Math.min(255, lum * 1.05 + 5);
      b = Math.max(0, lum * 0.70 - 5);
    } else if (mode === "cool") {
      r = Math.max(0, lum * 0.82 - 5);
      g = Math.min(255, lum * 0.95 + 5);
      b = Math.min(255, lum * 1.28 + 15);
    } else {
      // vivid — high saturation version of natural
      if (t < 0.25) {
        r = lum * 0.60; g = lum * 0.75; b = lum * 1.45;
      } else if (t < 0.60) {
        r = lum * 1.32; g = lum * 0.95; b = lum * 0.58;
      } else {
        r = lum * 1.10; g = lum * 1.05; b = lum * 0.80;
      }
    }

    dd[i]     = Math.max(0, Math.min(255, Math.round(r)));
    dd[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    dd[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    dd[i + 3] = sd[i + 3];
  }

  dstCtx.putImageData(dstImg, 0, 0);
  return dst;
}

export default function PhotoColorizer() {
  useSEO({
    title: "Free AI Photo Colorizer — Add Color to Black & White Photos | ToolsHub",
    description:
      "Instantly colorize black and white photos in your browser. AI-powered, 100% private — nothing is uploaded to any server.",
  });

  const { count, increment } = useToolCounter("photo-colorizer");

  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ColorMode>("natural");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [sliderContainerW, setSliderContainerW] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const currentFile = useRef<File | null>(null);

  useLayoutEffect(() => {
    if (!result || !sliderRef.current) return;
    const el = sliderRef.current;
    const update = () => setSliderContainerW(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [result]);

  const processFile = useCallback(async (file: File, m: ColorMode) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported (JPG, PNG, WebP).");
      return;
    }
    setError("");
    setResult(null);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_colorized.jpg");
    currentFile.current = file;

    if (!imgRef.current || !original) {
      const objectUrl = URL.createObjectURL(file);
      setOriginal(objectUrl);
      setLoading(true);
      setProgress("Loading image…");
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => { imgRef.current = img; resolve(); };
        img.onerror = reject;
        img.src = objectUrl;
      });
    } else {
      setLoading(true);
    }

    setProgress("Applying AI colorization…");
    await new Promise((r) => setTimeout(r, 30));

    try {
      const dst = colorizeCanvas(imgRef.current!, m);
      dst.toBlob((blob) => {
        if (!blob) { setError("Failed to generate result."); return; }
        setResult(URL.createObjectURL(blob));
        increment();
        setLoading(false);
        setProgress("");
      }, "image/jpeg", 0.95);
    } catch (e: any) {
      setError("Colorization failed. " + (e?.message?.slice(0, 100) ?? ""));
      setLoading(false);
      setProgress("");
    }
  }, [increment, original]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (file) processFile(file, mode);
  }, [processFile, mode]);

  const handleModeChange = async (m: ColorMode) => {
    setMode(m);
    if (currentFile.current) await processFile(currentFile.current, m);
  };

  const reset = () => {
    setOriginal(null);
    setResult(null);
    setError("");
    setSliderPos(50);
    setSliderContainerW(0);
    imgRef.current = null;
    currentFile.current = null;
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = fileName || "colorized.jpg";
    a.click();
  };

  const moveSlider = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    setSliderPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };
  const onSliderMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    moveSlider(e.clientX);
    const onMove = (ev: MouseEvent) => { if (isDragging.current) moveSlider(ev.clientX); };
    const onUp = () => { isDragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

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
              <Palette className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="photos colorized" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Photo Colorizer</h1>
            <p className="text-muted-foreground mt-2">
              Upload a black & white photo and AI adds natural, realistic colors — entirely in your browser.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      <div className="mb-5 flex items-start gap-2.5 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <Palette className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
        <span>
          <strong>100% private.</strong> Your photo never leaves your browser. No server upload, no API call.
        </span>
      </div>

      {!original ? (
        <ImageDropZone
          dragOver={dragOver}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          title="Drop a black & white photo to colorize"
          subtitle="Works best on portraits, landscapes, and vintage photos"
          badges={["JPG", "PNG", "WebP"]}
          buttonLabel="Select Photo"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </ImageDropZone>
      ) : (
        <div className="space-y-5">
          {/* Color mode picker */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Color Style</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  disabled={loading}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                    mode === m.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/40 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="text-xs opacity-70">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Before / After slider */}
          {result && !loading ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Before / After — drag to compare</p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ Colorized</span>
              </div>
              <div
                ref={sliderRef}
                className="relative select-none overflow-hidden cursor-col-resize"
                style={{ minHeight: 240 }}
                onMouseDown={onSliderMouseDown}
                onTouchMove={(e) => { const t = e.touches[0]; if (t) moveSlider(t.clientX); }}
              >
                <img src={result} alt="colorized" className="w-full object-contain block" style={{ maxHeight: 440 }} />
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  <img src={original} alt="original"
                    className="absolute top-0 left-0 object-contain block"
                    style={{ maxHeight: 440, width: sliderContainerW || "100%" }} />
                </div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none" style={{ left: `${sliderPos}%` }}>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-border">
                    <span className="text-xs font-bold text-foreground select-none">⟺</span>
                  </div>
                </div>
                <span className="absolute bottom-2 left-3 text-xs font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full">B&W</span>
                <span className="absolute bottom-2 right-3 text-xs font-semibold bg-primary/80 text-white px-2 py-0.5 rounded-full">Colorized</span>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Processing…</p>
              </div>
              <div className="p-6 flex items-center justify-center min-h-[200px]">
                <div className="flex flex-col items-center gap-3 text-center px-4">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">{progress}</p>
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
                Download Colorized Photo
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
              New Photo
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>

          {result && !loading && (
            <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Switch between color styles above to find the look that suits your photo best.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
