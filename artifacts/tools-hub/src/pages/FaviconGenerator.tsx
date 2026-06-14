import { useState, useRef, useCallback } from "react";
import { Download, Globe, X, RefreshCw } from "lucide-react";
import JSZip from "jszip";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

const SIZES = [16, 32, 48, 64, 96, 128, 192, 256, 512];

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  return `${(b / 1024).toFixed(1)} KB`;
}

function resizeToCanvas(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  return canvas;
}

export default function FaviconGenerator() {
  useSEO({
    title: "Free Favicon Generator — Create Favicon from Image | ToolsHub",
    description:
      "Upload any image and get all favicon sizes (16px to 512px) as a ZIP. Free, instant, no upload to server.",
  });

  const { count, increment } = useToolCounter("favicon-generator");

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setPreview(url);
      // Generate small previews
      const ps: Record<number, string> = {};
      [16, 32, 48, 64, 96, 128, 192, 256, 512].forEach((size) => {
        ps[size] = resizeToCanvas(img, size).toDataURL("image/png");
      });
      setPreviews(ps);
      increment();
    };
    img.src = url;
  }, [increment]);

  const handleFiles = (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (file) loadFile(file);
  };

  const downloadAll = async () => {
    if (!image) return;
    setGenerating(true);
    try {
      const zip = new JSZip();
      for (const size of SIZES) {
        const canvas = resizeToCanvas(image, size);
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
        zip.file(`favicon-${size}x${size}.png`, blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "favicons.zip";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  const downloadOne = (size: number) => {
    if (!previews[size]) return;
    const a = document.createElement("a");
    a.href = previews[size];
    a.download = `favicon-${size}x${size}.png`;
    a.click();
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
              <Globe className="w-3.5 h-3.5" />
              <span>Generator Tools</span>
              <UsageCount count={count} label="favicon generated" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Favicon Generator</h1>
            <p className="text-muted-foreground mt-2">
              Upload any image and get all favicon sizes from 16×16 to 512×512. Download as a ZIP — ready for your website.
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
          title="Drop your logo or image here"
          subtitle="Best results with square images (PNG with transparent background)"
          badges={["JPG", "PNG", "WebP", "SVG"]}
          buttonLabel="Select Image"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </ImageDropZone>
      ) : (
        <div className="space-y-5">
          {/* Preview grid */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-foreground">Generated Sizes</p>
              <span className="text-xs text-muted-foreground">{SIZES.length} sizes ready</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => downloadOne(size)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  title={`Download ${size}×${size}`}
                >
                  {previews[size] ? (
                    <div
                      className="rounded-md overflow-hidden flex-shrink-0"
                      style={{
                        width: Math.min(size, 48),
                        height: Math.min(size, 48),
                        backgroundImage: "repeating-conic-gradient(#d0d0d8 0% 25%, white 0% 50%)",
                        backgroundSize: "8px 8px",
                      }}
                    >
                      <img src={previews[size]} alt={`${size}px`}
                        style={{ width: Math.min(size, 48), height: Math.min(size, 48) }}
                        className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-muted animate-pulse" />
                  )}
                  <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    {size}×{size}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Original info */}
          {preview && (
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <img src={preview} alt="original"
                className="w-12 h-12 rounded-lg object-contain border border-border bg-muted/20" />
              <div>
                <p className="text-sm font-medium text-foreground">Original Image</p>
                <p className="text-xs text-muted-foreground">
                  {image.naturalWidth}×{image.naturalHeight}px
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadAll} disabled={generating} className="gap-2">
              <Download className="w-4 h-4" />
              {generating ? "Packing ZIP…" : `Download All (ZIP · ${SIZES.length} sizes)`}
            </Button>
            <Button variant="outline" onClick={() => { setImage(null); setPreview(null); setPreviews({}); }} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              New Image
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          </div>

          <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
            💡 <strong>How to use:</strong> Add <code className="bg-muted px-1 rounded text-xs">favicon-32x32.png</code> and <code className="bg-muted px-1 rounded text-xs">favicon-16x16.png</code> to your site root, then reference them in your HTML <code className="bg-muted px-1 rounded text-xs">&lt;head&gt;</code>.
          </div>
        </div>
      )}
    </div>
  );
}
