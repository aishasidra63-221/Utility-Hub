import { useState, useRef, useCallback } from "react";
import { Upload, Download, X, Smartphone, CheckCircle2, Loader2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";
import JSZip from "jszip";

type Status = "pending" | "converting" | "done" | "error";
interface FileItem {
  id: string;
  name: string;
  size: number;
  status: Status;
  blobUrl?: string;
  outputName?: string;
  error?: string;
}

export default function HeicConverter() {
  useSEO({
    title: "Free HEIC to JPG Converter — Convert iPhone Photos Online | ToolsHub",
    description: "Convert HEIC and HEIF photos to JPG instantly in your browser. No upload, 100% private. Works with iPhone photos.",
  });

  const { count, increment } = useToolCounter("heic-converter");
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) =>
      f.name.toLowerCase().endsWith(".heic") ||
      f.name.toLowerCase().endsWith(".heif") ||
      f.type === "image/heic" || f.type === "image/heif"
    );
    if (!valid.length) return;
    const items: FileItem[] = valid.map((f) => ({
      id: `${f.name}-${f.size}-${Math.random()}`,
      name: f.name,
      size: f.size,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...items]);

    // Convert each
    items.forEach(async (item) => {
      setFiles((prev) => prev.map((x) => x.id === item.id ? { ...x, status: "converting" } : x));
      try {
        const file = valid.find((f) => f.name === item.name && f.size === item.size)!;
        const heic2any = (await import("heic2any")).default;
        const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
        const blob = Array.isArray(result) ? result[0] : result;
        const blobUrl = URL.createObjectURL(blob);
        const outputName = item.name.replace(/\.(heic|heif)$/i, ".jpg");
        setFiles((prev) => prev.map((x) =>
          x.id === item.id ? { ...x, status: "done", blobUrl, outputName } : x
        ));
        increment();
      } catch {
        setFiles((prev) => prev.map((x) =>
          x.id === item.id ? { ...x, status: "error", error: "Conversion failed" } : x
        ));
      }
    });
  }, [increment]);

  const remove = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.blobUrl) URL.revokeObjectURL(f.blobUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const downloadOne = (item: FileItem) => {
    if (!item.blobUrl || !item.outputName) return;
    const a = document.createElement("a");
    a.href = item.blobUrl;
    a.download = item.outputName;
    a.click();
  };

  const downloadAll = async () => {
    const done = files.filter((f) => f.status === "done" && f.blobUrl);
    if (!done.length) return;
    setZipping(true);
    const zip = new JSZip();
    for (const f of done) {
      const resp = await fetch(f.blobUrl!);
      const buf = await resp.arrayBuffer();
      zip.file(f.outputName!, buf);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "converted-photos.zip";
    a.click();
    setZipping(false);
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const convertingCount = files.filter((f) => f.status === "converting").length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Image Tools</span>
            <UsageCount count={count} label="converted" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">HEIC to JPG</h1>
          <p className="text-muted-foreground mt-2">
            Convert iPhone HEIC photos to JPG. Batch conversion, 100% in your browser.
          </p>
        </div>
        <div className="absolute top-0 right-0">
          <ShareButton
            onCopy={async () => { await navigator.clipboard.writeText(window.location.href); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); }}
            copied={linkCopied} label="Share"
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles([...e.dataTransfer.files]); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`relative rounded-2xl py-14 px-8 text-center mb-6 overflow-hidden select-none ${
          dragOver ? "dropzone-active" : "dropzone-idle"
        }`}
      >
        {/* Corner brackets */}
        <span className={`absolute top-3 left-3 w-5 h-5 border-t-[2.5px] border-l-[2.5px] rounded-tl transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />
        <span className={`absolute top-3 right-3 w-5 h-5 border-t-[2.5px] border-r-[2.5px] rounded-tr transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />
        <span className={`absolute bottom-3 left-3 w-5 h-5 border-b-[2.5px] border-l-[2.5px] rounded-bl transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />
        <span className={`absolute bottom-3 right-3 w-5 h-5 border-b-[2.5px] border-r-[2.5px] rounded-br transition-colors duration-200 ${dragOver ? "border-primary" : "border-primary/40"}`} />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
            dragOver ? "bg-primary scale-105 shadow-primary/40" : "bg-primary hover:bg-primary/90 hover:scale-[1.02] shadow-primary/25"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Select HEIC Files
        </button>

        <p className={`mt-4 text-xs transition-colors duration-200 ${dragOver ? "text-primary font-medium" : "text-muted-foreground"}`}>
          {dragOver ? "Release to upload" : "or drop files here"}
        </p>

        <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
          {[".heic", ".heif"].map((b) => (
            <span key={b} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors duration-200 ${dragOver ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}>{b}</span>
          ))}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors duration-200 ${dragOver ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}`}>Batch OK</span>
        </div>
        <input ref={inputRef} type="file" accept=".heic,.heif,image/heic,image/heif" multiple className="hidden"
          onChange={(e) => { if (e.target.files) addFiles([...e.target.files]); }} />
      </div>

      {/* Info tip */}
      <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground mb-6 flex items-start gap-2">
        <span className="text-base leading-none mt-0.5">💡</span>
        <span>
          <strong className="text-foreground">iPhone pe:</strong> Files app → photo select karo → Share → "Save to Files" se .heic file milegi.
          WhatsApp aur other apps se photos already JPG format mein aati hain.
        </span>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                {/* Status icon */}
                <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                  {f.status === "pending"    && <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />}
                  {f.status === "converting" && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                  {f.status === "done"       && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {f.status === "error"      && <X className="w-5 h-5 text-red-500" />}
                </div>

                {/* Name + size */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(f.size / 1024).toFixed(0)} KB
                    {f.status === "converting" && " · Converting…"}
                    {f.status === "done"       && ` · → ${f.outputName}`}
                    {f.status === "error"      && ` · ${f.error}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {f.status === "done" && (
                    <Button size="sm" variant="outline" onClick={() => downloadOne(f)} className="gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      JPG
                    </Button>
                  )}
                  <button onClick={() => remove(f.id)} className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary + actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <p className="text-sm text-muted-foreground flex-1">
              {doneCount > 0 && <span className="text-green-600 dark:text-green-400 font-semibold">{doneCount} converted</span>}
              {convertingCount > 0 && <span className="text-primary font-semibold ml-2">{convertingCount} converting…</span>}
            </p>
            {doneCount > 1 && (
              <Button onClick={downloadAll} disabled={zipping} className="gap-2">
                {zipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                {zipping ? "Creating ZIP…" : `Download All (${doneCount}) as ZIP`}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setFiles([])} className="gap-1.5">
              <X className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
