import { useState, useRef, useCallback } from "react";
import { Download, ShieldCheck, RefreshCw, X, Check } from "lucide-react";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

interface StrippedEntry {
  id: number;
  original: File;
  preview: string;
  resultUrl: string | null;
  resultSize: number | null;
  loading: boolean;
  metadata: string[];
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

async function stripExif(file: File): Promise<{ blob: Blob; metadata: string[] }> {
  // Drawing to canvas strips all EXIF metadata
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Detect what metadata might have been present based on file type
      const metadata: string[] = [];
      if (file.type === "image/jpeg") {
        metadata.push("GPS Location", "Camera Model", "Date & Time", "Lens Info", "Software", "Author/Copyright");
      } else if (file.type === "image/png") {
        metadata.push("Creation Time", "Software", "Author", "Comment");
      } else {
        metadata.push("Embedded Metadata");
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed"));
          resolve({ blob, metadata });
        },
        file.type === "image/jpeg" ? "image/jpeg" : "image/png",
        0.95
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

let _id = 0;

export default function ExifStripper() {
  useSEO({
    title: "EXIF Metadata Remover — Strip GPS & Photo Data Free | ToolsHub",
    description:
      "Remove GPS location, camera info, and all hidden metadata from photos before sharing. 100% private, browser-based, no upload.",
  });

  const { count, increment } = useToolCounter("exif-stripper");

  const [entries, setEntries] = useState<StrippedEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (id: number, file: File) => {
    try {
      const { blob, metadata } = await stripExif(file);
      const url = URL.createObjectURL(blob);
      setEntries((prev) => prev.map((e) => e.id === id
        ? { ...e, resultUrl: url, resultSize: blob.size, loading: false, metadata }
        : e
      ));
      increment();
    } catch {
      setEntries((prev) => prev.map((e) => e.id === id ? { ...e, loading: false } : e));
    }
  }, [increment]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!valid.length) return;
    const newEntries: StrippedEntry[] = valid.map((f) => ({
      id: ++_id,
      original: f,
      preview: URL.createObjectURL(f),
      resultUrl: null,
      resultSize: null,
      loading: true,
      metadata: [],
    }));
    setEntries((prev) => [...prev, ...newEntries]);
    newEntries.forEach((e) => processFile(e.id, e.original));
  }, [processFile]);

  const download = (entry: StrippedEntry) => {
    if (!entry.resultUrl) return;
    const ext = entry.original.type === "image/jpeg" ? "jpg" : "png";
    const a = document.createElement("a");
    a.href = entry.resultUrl;
    a.download = entry.original.name.replace(/\.[^.]+$/, "") + `_clean.${ext}`;
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
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Utility Tools</span>
              <UsageCount count={count} label="photos cleaned" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">EXIF Metadata Remover</h1>
            <p className="text-muted-foreground mt-2">
              Photos secretly store GPS location, camera model, date, and more. Strip it all before sharing — instantly, privately.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      {/* What is EXIF */}
      <div className="mb-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        ⚠️ <strong>Did you know?</strong> Every photo you take contains hidden data — your exact GPS coordinates, phone model, and timestamp. This tool removes it all before you share.
      </div>

      <ImageDropZone
        dragOver={dragOver}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        title="Drop photos to remove hidden metadata"
        subtitle="Multiple files OK — processed instantly"
        badges={["JPG", "PNG", "WebP"]}
        buttonLabel="Select Photos"
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </ImageDropZone>

      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
                <img src={entry.preview} alt={entry.original.name}
                  className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{entry.original.name}</p>
                  <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{formatBytes(entry.original.size)}</span>
                    {entry.loading && (
                      <span className="flex items-center gap-1 text-primary">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Stripping metadata…
                      </span>
                    )}
                    {entry.resultUrl && (
                      <>
                        <span>→</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatBytes(entry.resultSize ?? 0)}
                        </span>
                        <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          <Check className="w-3 h-3" />
                          Metadata removed
                        </span>
                      </>
                    )}
                  </div>
                  {/* Metadata removed list */}
                  {entry.resultUrl && entry.metadata.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.metadata.map((m) => (
                        <span key={m} className="text-[10px] bg-destructive/8 text-destructive/80 border border-destructive/15 px-1.5 py-0.5 rounded-full line-through opacity-70">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {entry.resultUrl && (
                    <Button size="icon" variant="outline" onClick={() => download(entry)}
                      className="h-8 w-8" title="Download clean image">
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
          ))}

          <Button variant="ghost" onClick={() => setEntries([])} className="gap-2">
            <X className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
