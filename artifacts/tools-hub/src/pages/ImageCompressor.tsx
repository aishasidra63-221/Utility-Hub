import { useState, useRef, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Download, ImageIcon, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ShareButton } from "@/components/ShareButton";
import { useSEO } from "@/hooks/useSEO";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

async function copyCurrentUrl(): Promise<void> {
  await navigator.clipboard.writeText(window.location.href);
}

export default function ImageCompressor() {
  useSEO({
    title: "Free Image Compressor — Compress JPG, PNG, WebP Online | ToolsHub",
    description:
      "Compress images online for free. Reduce JPG, PNG, and WebP file sizes in your browser — no upload to any server. Instant, private, and free.",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [compressed, setCompressed] = useState<{ file: File; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.match(/image\/(jpeg|png|webp)/)) return;
    setFile(f);
    setCompressed(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const compress = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const options = {
        maxSizeMB: 10,
        useWebWorker: true,
        initialQuality: quality / 100,
        alwaysKeepResolution: true,
      };
      const result = await imageCompression(file, options);
      const url = URL.createObjectURL(result);
      setCompressed({ file: result, url });
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!compressed) return;
    const a = document.createElement("a");
    a.href = compressed.url;
    const ext = file?.name.split(".").pop() ?? "jpg";
    a.download = `compressed.${ext}`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setCompressed(null);
  };

  const handleShareLink = async () => {
    await copyCurrentUrl();
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const savings =
    file && compressed
      ? Math.round(((file.size - compressed.file.size) / file.size) * 100)
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image Tools</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Image Compressor</h1>
            <p className="text-muted-foreground mt-2">
              Reduce JPG, PNG, and WebP file sizes — entirely in your browser. Nothing is uploaded to any server.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      {!file ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          data-testid="dropzone-image"
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">Drop an image here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            data-testid="input-image-file"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Original</span>
                <span className="text-xs font-mono text-muted-foreground" data-testid="text-original-size">
                  {formatBytes(file.size)}
                </span>
              </div>
              {preview && (
                <img src={preview} alt="Original" className="w-full object-contain max-h-48 bg-muted/20" />
              )}
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Compressed</span>
                {compressed && (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400" data-testid="text-compressed-size">
                    {formatBytes(compressed.file.size)}
                  </span>
                )}
              </div>
              {compressed ? (
                <img src={compressed.url} alt="Compressed" className="w-full object-contain max-h-48 bg-muted/20" />
              ) : (
                <div className="h-48 flex items-center justify-center bg-muted/10">
                  <p className="text-xs text-muted-foreground">Click &ldquo;Compress&rdquo; to preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Savings badge */}
          {savings !== null && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              savings > 0
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
              data-testid="text-savings"
            >
              {savings > 0 ? `Saved ${savings}% (${formatBytes(file.size - compressed!.file.size)})` : "No reduction at this quality level"}
            </div>
          )}

          {/* Quality slider */}
          <div className="space-y-3 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Quality</label>
              <span className="text-sm font-mono font-semibold text-primary" data-testid="text-quality-value">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={([v]) => { setQuality(v); setCompressed(null); }}
              min={10}
              max={100}
              step={5}
              data-testid="slider-quality"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Best quality</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={compress}
              disabled={loading}
              data-testid="button-compress"
              className="flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Compressing...
                </>
              ) : (
                "Compress Image"
              )}
            </Button>
            {compressed && (
              <Button
                variant="outline"
                onClick={download}
                data-testid="button-download-compressed"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="ghost" onClick={reset} data-testid="button-reset-image" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
