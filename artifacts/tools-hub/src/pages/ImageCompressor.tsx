import { useState, useRef, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Download, ImageIcon, X, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";
import { getSettings } from "@/hooks/useSettings";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface CompressedResult { file: File; url: string; }
interface FileEntry {
  id: number;
  original: File;
  preview: string;
  compressed: CompressedResult | null;
  loading: boolean;
  error: string | null;
}

let _idCounter = 0;
const nextId = () => ++_idCounter;

async function compressFile(file: File, quality: number): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 50,
    useWebWorker: true,
    initialQuality: quality / 100,
    alwaysKeepResolution: true,
  });
}

export default function ImageCompressor() {
  useSEO({
    title: "Free Image Compressor — Compress JPG, PNG, WebP Online | ToolsHub",
    description: "Compress images online for free. Reduce JPG, PNG, and WebP file sizes in your browser — no upload to any server. Instant, private, and free.",
  });

  const { count, increment } = useToolCounter("image-compressor");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [quality, setQuality] = useState(() => getSettings().imageQuality);
  const [localQuality, setLocalQuality] = useState(() => getSettings().imageQuality);
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const incrementRef = useRef(increment);
  useEffect(() => { incrementRef.current = increment; }, [increment]);

  const compressEntry = useCallback(async (id: number, file: File, q: number) => {
    try {
      const result = await compressFile(file, q);
      const url = URL.createObjectURL(result);
      setEntries((prev) =>
        prev.map((e) => e.id === id ? { ...e, compressed: { file: result, url }, loading: false } : e)
      );
      incrementRef.current();
    } catch {
      setEntries((prev) =>
        prev.map((e) => e.id === id ? { ...e, loading: false, error: "Compression failed" } : e)
      );
    }
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const valid = Array.from(fileList).filter((f) => f.type.match(/image\/(jpeg|png|webp)/));
      if (!valid.length) return;

      const newEntries: FileEntry[] = valid.map((f) => ({
        id: nextId(),
        original: f,
        preview: URL.createObjectURL(f),
        compressed: null,
        loading: true,
        error: null,
      }));

      setEntries((prev) => [...prev, ...newEntries]);

      newEntries.forEach((entry) => compressEntry(entry.id, entry.original, quality));
    },
    [quality, compressEntry]
  );

  const recompressAll = useCallback(
    (newQuality: number) => {
      setEntries((prev) => {
        const updated = prev.map((e) => ({ ...e, compressed: null, loading: true, error: null }));
        updated.forEach((entry) => compressEntry(entry.id, entry.original, newQuality));
        return updated;
      });
    },
    [compressEntry]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const downloadOne = (entry: FileEntry) => {
    if (!entry.compressed) return;
    const a = document.createElement("a");
    a.href = entry.compressed.url;
    const ext = entry.original.name.split(".").pop() ?? "jpg";
    const baseName = entry.original.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}-compressed.${ext}`;
    a.click();
  };

  const downloadAll = () => entries.forEach(downloadOne);

  const removeEntry = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const reset = () => setEntries([]);

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const allDone = entries.length > 0 && entries.every((e) => !e.loading);
  const anyCompressed = entries.some((e) => e.compressed);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="compression" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Image Compressor</h1>
            <p className="text-muted-foreground mt-2">
              Drop images and they compress instantly. JPG, PNG, WebP — 100% in your browser.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        data-testid="dropzone-image"
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">Drop images — compresses instantly</p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP · Multiple files OK</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          data-testid="input-image-file"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {entries.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-3 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Quality</label>
              <span className="text-sm font-mono font-semibold text-primary" data-testid="text-quality-value">
                {localQuality}%
              </span>
            </div>
            <Slider
              value={[localQuality]}
              onValueChange={([v]) => setLocalQuality(v)}
              onValueCommit={([v]) => {
                setQuality(v);
                recompressAll(v);
              }}
              min={10}
              max={100}
              step={1}
              data-testid="slider-quality"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Best quality</span>
            </div>
          </div>

          <div className="space-y-3">
            {entries.map((entry) => {
              const savings =
                entry.compressed
                  ? Math.round(((entry.original.size - entry.compressed.file.size) / entry.original.size) * 100)
                  : null;
              return (
                <div key={entry.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
                    <img
                      src={entry.preview}
                      alt={entry.original.name}
                      className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{entry.original.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span data-testid="text-original-size">{formatBytes(entry.original.size)}</span>
                        {entry.loading && (
                          <span className="flex items-center gap-1 text-primary">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Compressing…
                          </span>
                        )}
                        {entry.compressed && savings !== null && (
                          <>
                            <span>→</span>
                            <span
                              className={savings > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}
                              data-testid="text-compressed-size"
                            >
                              {formatBytes(entry.compressed.file.size)}
                            </span>
                            {savings > 0 && (
                              <span
                                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                data-testid="text-savings"
                              >
                                -{savings}%
                              </span>
                            )}
                          </>
                        )}
                        {entry.error && <span className="text-destructive">{entry.error}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {entry.compressed && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => downloadOne(entry)}
                          data-testid="button-download-compressed"
                          title="Download"
                          className="h-8 w-8"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeEntry(entry.id)}
                        data-testid="button-reset-image"
                        className="h-8 w-8"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  {entry.loading && (
                    <div className="h-0.5 w-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary/60 animate-pulse w-2/3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            {allDone && anyCompressed && entries.length > 1 && (
              <Button onClick={downloadAll} data-testid="button-download-all">
                <Download className="w-4 h-4 mr-2" />
                Download All ({entries.filter((e) => e.compressed).length})
              </Button>
            )}
            <Button variant="ghost" onClick={reset}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
