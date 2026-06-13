import { useState, useRef, useCallback } from "react";
import { ArrowLeftRight, Upload, Download, X, RefreshCw, Zap, Check } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";
import { getSettings } from "@/hooks/useSettings";

type Format = "image/jpeg" | "image/png" | "image/webp";

interface FormatOption {
  value: Format;
  label: string;
  ext: string;
  quality: boolean;
}

const FORMATS: FormatOption[] = [
  { value: "image/jpeg", label: "JPG", ext: "jpg", quality: true },
  { value: "image/png", label: "PNG", ext: "png", quality: false },
  { value: "image/webp", label: "WebP", ext: "webp", quality: true },
];

interface ConvertedEntry {
  originalName: string;
  originalSize: number;
  originalFile: File;
  originalUrl: string;
  convertedUrl: string;
  convertedSize: number;
  convertedBlob: Blob;
  loading: boolean;
  error: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

async function convertImage(file: File, toFormat: Format, quality: number): Promise<{ blob: Blob; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const srcUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;

      if (toFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(srcUrl);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Conversion failed")); return; }
          resolve({ blob, url: URL.createObjectURL(blob) });
        },
        toFormat,
        toFormat === "image/png" ? undefined : quality / 100
      );
    };
    img.onerror = () => { URL.revokeObjectURL(srcUrl); reject(new Error("Failed to load image")); };
    img.src = srcUrl;
  });
}

export default function ImageConverter() {
  useSEO({
    title: "Free Image Format Converter — JPG ↔ PNG ↔ WebP Online | ToolsHub",
    description:
      "Convert images between JPG, PNG, and WebP formats instantly in your browser. Batch convert multiple files. No upload to server.",
  });

  const { count, increment } = useToolCounter("image-converter");
  const [entries, setEntries] = useState<ConvertedEntry[]>([]);
  const [targetFormat, setTargetFormat] = useState<Format>(() => {
    const f = getSettings().imageOutputFormat;
    return f === "jpg" ? "image/jpeg" : f === "png" ? "image/png" : "image/webp";
  });
  const [quality, setQuality] = useState(90);
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [allDownloaded, setAllDownloaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const targetFmt = FORMATS.find((f) => f.value === targetFormat)!;

  const processFiles = useCallback(
    async (files: File[], fmt: Format, q: number) => {
      const valid = files.filter((f) => f.type.startsWith("image/"));
      if (!valid.length) return;

      const startIdx = entries.length;
      const newEntries: ConvertedEntry[] = valid.map((f) => ({
        originalName: f.name,
        originalSize: f.size,
        originalFile: f,
        originalUrl: URL.createObjectURL(f),
        convertedUrl: "",
        convertedSize: 0,
        convertedBlob: new Blob(),
        loading: true,
        error: null,
      }));

      setEntries((prev) => [...prev, ...newEntries]);
      setAllDownloaded(false);

      await Promise.all(
        valid.map(async (file, localIdx) => {
          const globalIdx = startIdx + localIdx;
          try {
            const { blob, url } = await convertImage(file, fmt, q);
            setEntries((prev) => {
              const next = [...prev];
              next[globalIdx] = {
                ...next[globalIdx],
                convertedUrl: url,
                convertedSize: blob.size,
                convertedBlob: blob,
                loading: false,
              };
              return next;
            });
            increment();
          } catch {
            setEntries((prev) => {
              const next = [...prev];
              next[globalIdx] = { ...next[globalIdx], loading: false, error: "Conversion failed" };
              return next;
            });
          }
        })
      );
    },
    [entries.length, increment]
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => processFiles(Array.from(fileList), targetFormat, quality),
    [processFiles, targetFormat, quality]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const reconvertAll = async (fmt: Format, q: number) => {
    if (!entries.length) return;
    const snapshot = [...entries];
    setEntries((prev) => prev.map((e) => ({ ...e, convertedUrl: "", loading: true, error: null })));
    await Promise.all(
      snapshot.map(async (entry) => {
        try {
          const { blob: converted, url } = await convertImage(entry.originalFile, fmt, q);
          setEntries((prev) =>
            prev.map((e) => e.originalName === entry.originalName && e.originalSize === entry.originalSize
              ? { ...e, convertedUrl: url, convertedSize: converted.size, convertedBlob: converted, loading: false }
              : e)
          );
        } catch {
          setEntries((prev) =>
            prev.map((e) => e.originalName === entry.originalName && e.originalSize === entry.originalSize
              ? { ...e, loading: false, error: "Conversion failed" }
              : e)
          );
        }
      })
    );
  };

  const changeFormat = (fmt: Format) => {
    setTargetFormat(fmt);
    if (entries.length) reconvertAll(fmt, quality);
  };

  const changeQuality = (q: number) => {
    setQuality(q);
    if (entries.length) reconvertAll(targetFormat, q);
  };

  const downloadOne = (entry: ConvertedEntry) => {
    const baseName = entry.originalName.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = entry.convertedUrl;
    a.download = `${baseName}.${targetFmt.ext}`;
    a.click();
  };

  const downloadAll = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    entries.forEach((e) => {
      if (!e.convertedBlob.size) return;
      const baseName = e.originalName.replace(/\.[^.]+$/, "");
      zip.file(`${baseName}.${targetFmt.ext}`, e.convertedBlob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-${targetFmt.label.toLowerCase()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setAllDownloaded(true);
    setTimeout(() => setAllDownloaded(false), 3000);
  };

  const removeEntry = (idx: number) => {
    setEntries((prev) => {
      const entry = prev[idx];
      if (entry) {
        URL.revokeObjectURL(entry.originalUrl);
        if (entry.convertedUrl) URL.revokeObjectURL(entry.convertedUrl);
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  const reset = () => {
    setEntries((prev) => {
      prev.forEach((e) => {
        URL.revokeObjectURL(e.originalUrl);
        if (e.convertedUrl) URL.revokeObjectURL(e.convertedUrl);
      });
      return [];
    });
  };

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const allDone = entries.length > 0 && entries.every((e) => !e.loading);
  const converted = entries.filter((e) => e.convertedUrl && !e.error);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="relative">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="converted" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Image Format Converter</h1>
            <p className="text-muted-foreground mt-2">
              Convert JPG, PNG, and WebP in bulk — instantly in your browser. Nothing uploaded.
            </p>
          </div>
          <div className="absolute top-0 right-0">
            <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
          </div>
        </div>
      </div>

      {/* Format selector */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">Convert to</label>
          <div className="flex gap-2">
            {FORMATS.map((fmt) => (
              <button
                key={fmt.value}
                onClick={() => changeFormat(fmt.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  targetFormat === fmt.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {targetFmt.quality && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Quality</label>
              <span className="text-sm font-mono font-semibold text-primary">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={([v]) => changeQuality(v)}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Smaller file</span>
              <span>Best quality</span>
            </div>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <ImageDropZone
        dragOver={dragOver}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        title={<>Drop images — converts to <span className="text-primary font-semibold">{targetFmt.label}</span> instantly</>}
        subtitle="Multiple files OK"
        badges={["JPG", "PNG", "WebP", "GIF", "BMP"]}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </ImageDropZone>

      {/* Results */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry, idx) => {
            const savings = entry.convertedSize
              ? Math.round(((entry.originalSize - entry.convertedSize) / entry.originalSize) * 100)
              : null;
            return (
              <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
                  <img
                    src={entry.originalUrl}
                    alt={entry.originalName}
                    className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {entry.originalName.replace(/\.[^.]+$/, "")}.
                      <span className="text-primary">{targetFmt.ext}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span>{formatBytes(entry.originalSize)}</span>
                      {entry.loading && (
                        <span className="flex items-center gap-1 text-primary">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Converting...
                        </span>
                      )}
                      {entry.convertedUrl && savings !== null && (
                        <>
                          <span>→</span>
                          <span className={savings > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
                            {formatBytes(entry.convertedSize)}
                          </span>
                          {savings > 0 && (
                            <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              -{savings}%
                            </span>
                          )}
                          {savings < 0 && (
                            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              +{Math.abs(savings)}%
                            </span>
                          )}
                        </>
                      )}
                      {entry.error && <span className="text-destructive">{entry.error}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.convertedUrl && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => downloadOne(entry)}
                        title="Download"
                        className="h-8 w-8"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeEntry(idx)}
                      className="h-8 w-8"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bulk actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            {allDone && converted.length > 1 && (
              <Button onClick={downloadAll}>
                {allDownloaded ? (
                  <><Check className="w-4 h-4 mr-2 text-emerald-400" />Downloaded!</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" />Download All as ZIP ({converted.length})</>
                )}
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
