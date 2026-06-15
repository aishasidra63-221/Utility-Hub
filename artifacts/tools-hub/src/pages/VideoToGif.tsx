import { useState, useRef, useCallback } from "react";
import { Film, Download, Loader2, RefreshCw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

const FPS_OPTIONS = [5, 10, 15];
const WIDTH_OPTIONS = [320, 480, 640];
const MAX_DURATION = 15;

async function loadGifJs(): Promise<void> {
  if (typeof (window as any).GIF !== "undefined") return;
  const [mainRes, workerRes] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js"),
    fetch("https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js"),
  ]);
  const workerCode = await workerRes.text();
  const workerBlob = new Blob([workerCode], { type: "application/javascript" });
  (window as any).__gifWorkerUrl = URL.createObjectURL(workerBlob);
  const mainCode = await mainRes.text();
  const mainBlob = new Blob([mainCode], { type: "application/javascript" });
  const mainUrl = URL.createObjectURL(mainBlob);
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = mainUrl;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load GIF encoder. Check your internet connection."));
    document.head.appendChild(s);
  });
}

export default function VideoToGif() {
  useSEO({
    title: "Video to GIF Converter — Free Online Tool | ToolsHub",
    description: "Convert any video clip to an animated GIF in your browser. Choose FPS, size, and duration — no uploads, 100% private.",
  });

  const { count, increment } = useToolCounter("video-to-gif");

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [fps, setFps] = useState(10);
  const [outputWidth, setOutputWidth] = useState(480);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file (MP4, WebM, MOV, etc.).");
      return;
    }
    setError("");
    setResult(null);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  }, []);

  const onVideoLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    const d = v.duration;
    setDuration(d);
    setStartTime(0);
    setEndTime(Math.min(d, MAX_DURATION));
  };

  const convert = async () => {
    if (!videoRef.current || !videoFile) return;
    setLoading(true);
    setResult(null);
    setError("");
    setProgress("Loading GIF encoder…");

    try {
      await loadGifJs();

      const vid = videoRef.current;
      const clipDuration = Math.min(endTime, duration) - startTime;
      if (clipDuration <= 0) { setError("Invalid clip range."); return; }

      const frameCount = Math.min(Math.ceil(clipDuration * fps), 150);
      const aspect = vid.videoWidth / vid.videoHeight;
      const w = outputWidth;
      const h = Math.round(w / aspect);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      const gif = new (window as any).GIF({
        workers: 2,
        quality: 10,
        width: w,
        height: h,
        workerScript: (window as any).__gifWorkerUrl,
      });

      for (let i = 0; i < frameCount; i++) {
        const t = startTime + (i / frameCount) * clipDuration;
        vid.currentTime = t;
        await new Promise<void>((res) => { vid.onseeked = () => res(); });
        ctx.drawImage(vid, 0, 0, w, h);
        gif.addFrame(canvas, { copy: true, delay: Math.round(1000 / fps) });
        setProgress(`Capturing frames: ${Math.round(((i + 1) / frameCount) * 60)}%`);
      }

      setProgress("Encoding GIF…");
      const blob: Blob = await new Promise((resolve, reject) => {
        gif.on("progress", (p: number) => {
          setProgress(`Encoding GIF: ${Math.round(60 + p * 40)}%`);
        });
        gif.on("finished", resolve);
        gif.on("abort", () => reject(new Error("Encoding aborted.")));
        gif.render();
      });

      const sizeKB = (blob.size / 1024).toFixed(0);
      setResultSize(`${sizeKB} KB`);
      setResult(URL.createObjectURL(blob));
      increment();
    } catch (e: any) {
      console.error("Video to GIF error:", e);
      setError(e?.message || "Conversion failed. Try a shorter clip or smaller size.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const download = () => {
    if (!result || !videoFile) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = videoFile.name.replace(/\.[^.]+$/, "") + ".gif";
    a.click();
  };

  const reset = () => {
    setVideoUrl(null);
    setVideoFile(null);
    setResult(null);
    setError("");
    setDuration(0);
    setStartTime(0);
    setEndTime(5);
  };

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const clipDuration = Math.max(0, endTime - startTime);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center gap-3">
        <div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <Film className="w-3.5 h-3.5" />
            <span>Video Tools</span>
            <UsageCount count={count} label="GIFs created" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Video to GIF</h1>
          <p className="text-muted-foreground mt-2">
            Convert any video clip to an animated GIF. Trim, set FPS and size — all in your browser.
          </p>
        </div>
        <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
      </div>

      {!videoUrl ? (
        <div
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Film className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Drop a video file here</p>
            <p className="text-sm text-muted-foreground mt-1">MP4 · WebM · MOV · AVI</p>
          </div>
          <Button variant="default" className="pointer-events-none">Select Video</Button>
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Preview
              </p>
              <span className="text-xs text-muted-foreground">{videoFile?.name}</span>
            </div>
            <div className="p-3 flex justify-center bg-black">
              <video ref={videoRef} src={videoUrl} onLoadedMetadata={onVideoLoaded}
                controls className="max-h-56 max-w-full rounded" />
            </div>
          </div>

          {duration > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-foreground">Settings</p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Clip range</span>
                  <span>{startTime.toFixed(1)}s – {endTime.toFixed(1)}s ({clipDuration.toFixed(1)}s)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Start (s)</label>
                    <input type="range" min={0} max={duration - 0.5} step={0.1} value={startTime}
                      onChange={(e) => { const v = parseFloat(e.target.value); setStartTime(v); if (endTime - v < 0.5) setEndTime(Math.min(v + 0.5, duration)); }}
                      className="w-full accent-violet-500" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">End (s, max {MAX_DURATION}s)</label>
                    <input type="range" min={startTime + 0.5} max={Math.min(duration, startTime + MAX_DURATION)} step={0.1} value={endTime}
                      onChange={(e) => setEndTime(parseFloat(e.target.value))}
                      className="w-full accent-violet-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">FPS</label>
                  <div className="flex gap-2">
                    {FPS_OPTIONS.map((f) => (
                      <button key={f} onClick={() => setFps(f)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${fps === f ? "bg-violet-500 text-white border-violet-500" : "border-border text-muted-foreground hover:border-violet-400"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Width (px)</label>
                  <div className="flex gap-2">
                    {WIDTH_OPTIONS.map((w) => (
                      <button key={w} onClick={() => setOutputWidth(w)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${outputWidth === w ? "bg-violet-500 text-white border-violet-500" : "border-border text-muted-foreground hover:border-violet-400"}`}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                <span>Estimated frames: ~{Math.min(Math.ceil(clipDuration * fps), 150)}</span>
                <span>{outputWidth}px · {fps} FPS · {clipDuration.toFixed(1)}s</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          {result && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Result GIF</p>
                <span className="text-xs text-emerald-500 font-semibold">✓ {resultSize}</span>
              </div>
              <div className="p-3 bg-muted/20 flex justify-center">
                <img src={result} alt="GIF preview" className="max-h-56 max-w-full rounded" />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {!result && !loading && duration > 0 && (
              <Button onClick={convert} className="gap-2 bg-violet-600 hover:bg-violet-700">
                <Film className="w-4 h-4" />
                Convert to GIF
              </Button>
            )}
            {loading && (
              <Button disabled className="gap-2 opacity-70 bg-violet-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress || "Processing…"}
              </Button>
            )}
            {result && !loading && (
              <Button onClick={download} className="gap-2">
                <Download className="w-4 h-4" />
                Download GIF
              </Button>
            )}
            {result && !loading && (
              <Button variant="outline" onClick={convert} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Re-convert
              </Button>
            )}
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              New Video
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Keep clips under 10s and use 10 FPS for smaller GIF files. First conversion loads the encoder (~50KB) once.
          </div>
        </div>
      )}
    </div>
  );
}
