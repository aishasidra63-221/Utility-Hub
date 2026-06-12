import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, X, RefreshCw, Lock, Unlock, Maximize2, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const PRESETS = [
  { label: "HD",        w: 1280, h: 720  },
  { label: "Full HD",   w: 1920, h: 1080 },
  { label: "2K",        w: 2560, h: 1440 },
  { label: "4K",        w: 3840, h: 2160 },
  { label: "IG Square", w: 1080, h: 1080 },
  { label: "IG Story",  w: 1080, h: 1920 },
  { label: "Twitter",   w: 1600, h: 900  },
  { label: "LinkedIn",  w: 1200, h: 628  },
];

type OutFormat = "same" | "jpg" | "png" | "webp";

interface Dims { w: number; h: number; }

interface FileEntry {
  id: number;
  file: File;
  preview: string;
  origDims: Dims | null;
  result: { blob: Blob; url: string } | null;
  loading: boolean;
  error: string | null;
}

let _id = 0;
const uid = () => ++_id;

function getMime(file: File, fmt: OutFormat): string {
  if (fmt === "jpg") return "image/jpeg";
  if (fmt === "png") return "image/png";
  if (fmt === "webp") return "image/webp";
  return file.type || "image/png";
}

function getExt(file: File, fmt: OutFormat): string {
  if (fmt === "jpg") return "jpg";
  if (fmt === "png") return "png";
  if (fmt === "webp") return "webp";
  return file.name.split(".").pop() ?? "jpg";
}

async function getDims(file: File): Promise<Dims> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}

async function resizeFile(file: File, targetW: number, targetH: number, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width  = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      if (mime === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, targetW, targetH); }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Canvas export failed")), mime, quality / 100);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ImageResizer() {
  useSEO({
    title: "Free Image Resizer — Resize JPG, PNG, WebP Online | ToolsHub",
    description: "Resize images to any dimension in your browser. HD, Full HD, Instagram, custom — no upload, no server.",
  });

  const { count, increment } = useToolCounter("image-resizer");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [width,   setWidth]   = useState(1280);
  const [height,  setHeight]  = useState(720);
  const [locked,  setLocked]  = useState(true);
  const [format,  setFormat]  = useState<OutFormat>("same");
  const [quality, setQuality] = useState(90);
  const [localQ,  setLocalQ]  = useState(90);
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>("HD");
  const inputRef = useRef<HTMLInputElement>(null);
  const incrementRef = useRef(increment);
  useEffect(() => { incrementRef.current = increment; }, [increment]);

  const ratioRef = useRef(1280 / 720);

  const changeWidth = (v: number) => {
    setWidth(v);
    setActivePreset(null);
    if (locked) { const h = Math.round(v / ratioRef.current); setHeight(h); }
  };
  const changeHeight = (v: number) => {
    setHeight(v);
    setActivePreset(null);
    if (locked) { const w = Math.round(v * ratioRef.current); setWidth(w); }
  };
  const applyPreset = (p: typeof PRESETS[0]) => {
    setWidth(p.w); setHeight(p.h);
    ratioRef.current = p.w / p.h;
    setActivePreset(p.label);
  };

  const loadEntries = useCallback(async (files: File[]) => {
    const valid = files.filter((f) => f.type.match(/image\/(jpeg|png|webp|gif|bmp|svg\+xml)/));
    if (!valid.length) return;
    const isFirstBatch = entries.length === 0;
    const news: FileEntry[] = valid.map((f) => ({
      id: uid(), file: f, preview: URL.createObjectURL(f),
      origDims: null, result: null, loading: false, error: null,
    }));
    setEntries((prev) => [...prev, ...news]);
    let isFirst = true;
    for (const entry of news) {
      try {
        const dims = await getDims(entry.file);
        setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, origDims: dims } : e));
        if (isFirst && isFirstBatch) {
          ratioRef.current = dims.w / dims.h;
          setWidth(dims.w);
          setHeight(dims.h);
          setActivePreset(null);
        }
        isFirst = false;
      } catch { /* ignore */ }
    }
  }, [entries.length]);

  const handleFiles = useCallback((fl: FileList | File[]) => loadEntries(Array.from(fl)), [loadEntries]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const resizeAll = async () => {
    if (!entries.length) return;
    setEntries((prev) => prev.map((e) => ({ ...e, result: null, loading: true, error: null })));
    await Promise.all(entries.map(async (entry) => {
      try {
        const mime = getMime(entry.file, format);
        const blob = await resizeFile(entry.file, width, height, mime, quality);
        const url  = URL.createObjectURL(blob);
        setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, result: { blob, url }, loading: false } : e));
        incrementRef.current();
      } catch {
        setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, loading: false, error: "Resize failed" } : e));
      }
    }));
  };

  const downloadOne = (entry: FileEntry) => {
    if (!entry.result) return;
    const a = document.createElement("a");
    a.href = entry.result.url;
    a.download = `${entry.file.name.replace(/\.[^.]+$/, "")}-${width}x${height}.${getExt(entry.file, format)}`;
    a.click();
  };

  const downloadAll = () => entries.forEach(downloadOne);

  const remove = (id: number) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) {
        URL.revokeObjectURL(entry.preview);
        if (entry.result) URL.revokeObjectURL(entry.result.url);
      }
      return prev.filter((e) => e.id !== id);
    });
  };

  const reset = () => {
    setEntries((prev) => {
      prev.forEach((e) => {
        URL.revokeObjectURL(e.preview);
        if (e.result) URL.revokeObjectURL(e.result.url);
      });
      return [];
    });
  };
  const handleShare = async () => { await navigator.clipboard.writeText(window.location.href); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); };

  const allDone    = entries.length > 0 && entries.every((e) => !e.loading);
  const anyResult  = entries.some((e) => e.result);
  const anyLoading = entries.some((e) => e.loading);
  const showQuality = format === "jpg" || format === "webp";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="resize" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Image Resizer</h1>
            <p className="text-muted-foreground mt-2">Resize to any dimension — custom or preset. 100% in your browser.</p>
          </div>
          <ShareButton onCopy={handleShare} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <ZapIcon className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">Drop images here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP · Multiple files OK</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </div>

      {entries.length > 0 && (
        <div className="space-y-5">
          {/* Settings panel */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            {/* Presets */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preset Sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p.label} onClick={() => applyPreset(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${activePreset === p.label ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/50"}`}>
                    {p.label}
                    <span className="ml-1 opacity-60">{p.w}×{p.h}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Custom Dimensions</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Width (px)</label>
                  <input type="number" value={width} min={1} max={9999}
                    onChange={(e) => changeWidth(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button onClick={() => setLocked(!locked)}
                  className={`mt-5 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${locked ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
                  title={locked ? "Aspect ratio locked" : "Aspect ratio unlocked"}>
                  {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Height (px)</label>
                  <input type="number" value={height} min={1} max={9999}
                    onChange={(e) => changeHeight(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Format + Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Output Format</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["same", "jpg", "png", "webp"] as OutFormat[]).map((f) => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={`py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${format === f ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}>
                      {f === "same" ? "Auto" : f}
                    </button>
                  ))}
                </div>
              </div>
              {showQuality && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality</p>
                    <span className="text-xs font-mono text-primary">{localQ}%</span>
                  </div>
                  <Slider value={[localQ]} onValueChange={([v]) => setLocalQ(v)}
                    onValueCommit={([v]) => setQuality(v)} min={10} max={100} step={1} />
                </div>
              )}
            </div>

            {/* Resize button */}
            <Button onClick={resizeAll} disabled={anyLoading} className="w-full">
              {anyLoading ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Resizing…</>
              ) : (
                <><Maximize2 className="w-4 h-4 mr-2" />Resize {entries.length > 1 ? `All (${entries.length})` : "Image"} — {width}×{height}</>
              )}
            </Button>
          </div>

          {/* File cards */}
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
                  <img src={entry.preview} alt={entry.file.name}
                    className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.file.name}</p>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                      {entry.origDims && <span>{entry.origDims.w}×{entry.origDims.h}</span>}
                      <span>{formatBytes(entry.file.size)}</span>
                      {entry.loading && (
                        <span className="flex items-center gap-1 text-primary">
                          <RefreshCw className="w-3 h-3 animate-spin" />Resizing…
                        </span>
                      )}
                      {entry.result && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ {width}×{height} · {formatBytes(entry.result.blob.size)}
                        </span>
                      )}
                      {entry.error && <span className="text-destructive">{entry.error}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.result && (
                      <Button size="icon" variant="outline" onClick={() => downloadOne(entry)} title="Download" className="h-8 w-8">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => remove(entry.id)} className="h-8 w-8">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {entry.loading && (
                  <div className="h-0.5 bg-muted overflow-hidden">
                    <div className="h-full bg-primary/60 animate-pulse w-2/3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {allDone && anyResult && entries.length > 1 && (
              <Button onClick={downloadAll}>
                <Download className="w-4 h-4 mr-2" />
                Download All ({entries.filter((e) => e.result).length})
              </Button>
            )}
            <Button variant="ghost" onClick={reset}>
              <X className="w-4 h-4 mr-2" />Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
