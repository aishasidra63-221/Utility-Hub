import { useState, useRef, useCallback } from "react";
import { Upload, Download, Eraser, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

export default function BackgroundRemover() {
  useSEO({
    title: "Free Background Remover — Remove Image Background Instantly | ToolsHub",
    description:
      "Remove image backgrounds instantly in your browser. No API, no upload, 100% private. Powered by AI running locally.",
  });

  const { count, increment } = useToolCounter("bg-remover");

  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Sirf image files supported hain (JPG, PNG, WebP).");
      return;
    }
    setError("");
    setResult(null);
    setFileName(file.name.replace(/\.[^.]+$/, "") + "_no_bg.png");
    const objectUrl = URL.createObjectURL(file);
    setOriginal(objectUrl);
    setLoading(true);
    setProgress("AI model load ho raha hai…");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setProgress("Background remove ho rahi hai…");
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (key.includes("fetch") && total > 0) {
            const pct = Math.round((current / total) * 100);
            setProgress(`AI model download: ${pct}%`);
          }
        },
      });
      const url = URL.createObjectURL(blob);
      setResult(url);
      increment();
    } catch (e) {
      console.error(e);
      setError("Background remove nahi ho saka. Dobara try karein.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }, [increment]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setOriginal(null);
    setResult(null);
    setError("");
    setProgress("");
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = fileName || "background_removed.png";
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <Eraser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Background Remover</h1>
            <p className="text-sm text-muted-foreground">100% browser-based · No upload · Free forever</p>
          </div>
        </div>
        <UsageCount count={count} />
      </div>

      {/* First use note */}
      <div className="mb-5 flex items-start gap-2 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
        <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          <strong>Pehli baar:</strong> AI model (~80MB) browser mein download hoga — ek baar ho jaata hai, phir fast hoga.
        </span>
      </div>

      {!original ? (
        /* Drop Zone */
        <div
          className={`dropzone-idle rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? "dropzone-active" : ""}`}
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
              <p className="text-base font-semibold text-foreground">Image yahan drop karein</p>
              <p className="text-sm text-muted-foreground mt-1">ya click karein select karne ke liye</p>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP support</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              <ImageIcon className="w-4 h-4 mr-2" />
              Image Select Karein
            </Button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Before / After */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original</p>
              </div>
              <div className="p-3 bg-muted/30 flex items-center justify-center min-h-[220px]">
                <img src={original} alt="original" className="max-h-[280px] max-w-full rounded-lg object-contain" />
              </div>
            </div>

            {/* Result */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Background Removed</p>
              </div>
              <div
                className="p-3 flex items-center justify-center min-h-[220px]"
                style={{
                  backgroundImage: "repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%)",
                  backgroundSize: "20px 20px",
                }}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">{progress}</p>
                  </div>
                ) : result ? (
                  <img src={result} alt="result" className="max-h-[280px] max-w-full rounded-lg object-contain" />
                ) : (
                  <p className="text-sm text-muted-foreground">Processing…</p>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {result && !loading && (
              <Button onClick={download} className="gap-2">
                <Download className="w-4 h-4" />
                PNG Download Karein
              </Button>
            )}
            <Button variant="outline" onClick={reset} className="gap-2">
              <X className="w-4 h-4" />
              Nayi Image
            </Button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>

          {/* Tips */}
          {result && !loading && (
            <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Result PNG format mein hai transparent background ke saath. Kisi bhi color background par use kar sakte hain.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
