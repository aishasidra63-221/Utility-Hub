import { useState, useRef, useCallback } from "react";
import { Download, Target, RefreshCw, X, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { SpeedBadge } from "@/components/SpeedBadge";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

const PRESETS = [
  { label: "50 KB",  value: 50 },
  { label: "100 KB", value: 100 },
  { label: "200 KB", value: 200 },
  { label: "500 KB", value: 500 },
  { label: "1 MB",   value: 1024 },
  { label: "2 MB",   value: 2048 },
];

interface Result { file: File; url: string; ms: number; }

export default function TargetSizeCompressor() {
  useSEO({
    title: "Compress Image to Specific Size — Target File Size | ToolsHub",
    description:
      "Compress images to an exact target file size. Set 200KB, 500KB, or any size — the tool finds the right quality automatically. Free, browser-based.",
  });

  const { count, increment } = useToolCounter("target-compressor");

  const [entries, setEntries] = useState<{ id: number; file: File; preview: string; result: Result | null; loading: boolean; error: string | null }[]>([]);
  const [targetKB, setTargetKB] = useState(200);
  const [customKB, setCustomKB] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  let _id = useRef(0);

  const getTarget = () => customKB ? Math.max(10, parseInt(customKB) || targetKB) : targetKB;

  const compressToTarget = useCallback(async (id: number, file: File) => {
    const kb = getTarget();
    const t0 = performance.now();
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: kb / 1024,
        useWebWorker: true,
        initialQuality: 0.85,
        alwaysKeepResolution: true,
      });
      const ms = Math.round(performance.now() - t0);
      const url = URL.createObjectURL(compressed);
      setEntries((prev) => prev.map((e) => e.id === id ? { ...e, result: { file: compressed, url, ms }, loading: false } : e));
      increment();
    } catch {
      setEntries((prev) => prev.map((e) => e.id === id ? { ...e, loading: false, error: "Compression failed" } : e));
    }
  }, []);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => f.type.match(/image\/(jpeg|png|webp)/));
    if (!valid.length) return;
    const newEntries = valid.map((f) => ({
      id: ++_id.current,
      file: f,
      preview: URL.createObjectURL(f),
      result: null,
      loading: true,
      error: null,
    }));
    setEntries((prev) => [...prev, ...newEntries]);
    newEntries.forEach((e) => compressToTarget(e.id, e.file));
  }, [compressToTarget]);

  const recompressAll = () => {
    setEntries((prev) => {
      const updated = prev.map((e) => ({ ...e, result: null, loading: true, error: null }));
      updated.forEach((e) => compressToTarget(e.id, e.file));
      return updated;
    });
  };

  const download = (result: Result, name: string) => {
    const a = document.createElement("a");
    a.href = result.url;
    a.download = name.replace(/\.[^.]+$/, "") + `_${getTarget()}kb.jpg`;
    a.click();
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
              <Target className="w-3.5 h-3.5" />
              <span>Image Tools</span>
              <UsageCount count={count} label="compressed" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Target Size Compressor</h1>
            <p className="text-muted-foreground mt-2">
              Set a target file size — 200KB, 500KB, or any custom size. The tool automatically finds the right quality.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      {/* Target size selector */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Target File Size</label>
          <span className="text-sm font-mono font-semibold text-primary">
            {customKB ? `${customKB} KB` : PRESETS.find((p) => p.value === targetKB)?.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => { setTargetKB(p.value); setCustomKB(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                !customKB && targetKB === p.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              placeholder="Custom KB"
              value={customKB}
              onChange={(e) => setCustomKB(e.target.value)}
              className="w-24 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-muted/30 focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>
        {entries.length > 0 && (
          <Button variant="outline" size="sm" onClick={recompressAll} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Re-compress at new target
          </Button>
        )}
      </div>

      <ImageDropZone
        dragOver={dragOver}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        title={`Drop images — will compress to under ${customKB ? customKB + " KB" : PRESETS.find((p) => p.value === targetKB)?.label}`}
        subtitle="Multiple files OK"
        badges={["JPG", "PNG", "WebP"]}
        buttonLabel="Select Images"
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </ImageDropZone>

      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => {
            const savings = entry.result
              ? Math.round(((entry.file.size - entry.result.file.size) / entry.file.size) * 100)
              : null;
            const metTarget = entry.result ? entry.result.file.size <= getTarget() * 1024 : null;
            return (
              <div key={entry.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
                  <img src={entry.preview} alt={entry.file.name}
                    className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.file.name}</p>
                    <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{formatBytes(entry.file.size)}</span>
                      {entry.loading && (
                        <span className="flex items-center gap-1 text-primary">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Compressing…
                        </span>
                      )}
                      {entry.result && (
                        <>
                          <span>→</span>
                          <span className={metTarget ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-amber-600 font-medium"}>
                            {formatBytes(entry.result.file.size)}
                          </span>
                          {savings !== null && savings > 0 && (
                            <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              -{savings}%
                            </span>
                          )}
                          {metTarget ? (
                            <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              ✓ Target met
                            </span>
                          ) : (
                            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              Near target
                            </span>
                          )}
                          <SpeedBadge ms={entry.result.ms} />
                        </>
                      )}
                      {entry.error && <span className="text-destructive">{entry.error}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.result && (
                      <Button size="icon" variant="outline" onClick={() => download(entry.result!, entry.file.name)}
                        className="h-8 w-8" title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost"
                      onClick={() => setEntries((p) => p.filter((e) => e.id !== entry.id))}
                      className="h-8 w-8">
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

          <Button variant="ghost" onClick={() => setEntries([])} className="gap-2">
            <X className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
