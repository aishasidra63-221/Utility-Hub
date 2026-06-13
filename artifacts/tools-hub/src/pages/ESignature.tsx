import { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Link } from "wouter";
import {
  PenLine, Type, Upload, Download, X, RefreshCw, Trash2,
  FileText, ChevronLeft, ChevronRight, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Tab = "draw" | "type";
type Position = "top-left" | "top-right" | "center" | "bottom-left" | "bottom-right";

const POS_LABELS: { id: Position; label: string }[] = [
  { id: "top-left",     label: "Top Left" },
  { id: "top-center",   label: "Top Center" } as never,
  { id: "top-right",    label: "Top Right" },
  { id: "center",       label: "Center" },
  { id: "bottom-left",  label: "Bottom Left" },
  { id: "bottom-right", label: "Bottom Right" },
];

const POSITIONS: { id: Position; label: string }[] = [
  { id: "top-left",    label: "Top Left" },
  { id: "top-right",   label: "Top Right" },
  { id: "center",      label: "Center" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-right",label: "Bottom Right" },
];

const COLORS = ["#000000", "#1d4ed8", "#15803d", "#dc2626", "#7c3aed"];
const FONTS  = ["'Dancing Script', cursive", "'Pacifico', cursive", "'Caveat', cursive", "serif"];
const FONT_NAMES = ["Dancing Script", "Pacifico", "Caveat", "Serif"];

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function ESignature() {
  useSEO({ title: "E-Signature — ToolsHub", description: "Sign PDFs in your browser — draw or type your signature and embed it. No upload, 100% private." });
  const { count, increment } = useToolCounter("e-signature");

  const [tab, setTab]           = useState<Tab>("draw");
  const [color, setColor]       = useState(COLORS[0]);
  const [strokeW, setStrokeW]   = useState(3);
  const [typedSig, setTypedSig] = useState("");
  const [fontIdx, setFontIdx]   = useState(0);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [scale, setScale]       = useState(30);
  const [pdfFile, setPdfFile]   = useState<File | null>(null);
  const [pageNum, setPageNum]   = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [isEmpty, setIsEmpty]   = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef    = useRef<HTMLInputElement>(null);
  const drawing   = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&family=Caveat:wght@700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const clearCanvas = () => {
    const ctx = getCtx(); if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsEmpty(true);
  };

  const getXY = (e: React.MouseEvent | React.TouchEvent, rect: DOMRect) => {
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    drawing.current = true;
    lastPos.current = getXY(e, rect);
    const ctx = getCtx(); if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = getXY(e, rect);
    const ctx = getCtx(); if (!ctx) return;
    ctx.lineWidth   = strokeW;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.strokeStyle = color;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
    setIsEmpty(false);
  };

  const stopDraw = () => { drawing.current = false; };

  const getSignatureDataUrl = useCallback((): string | null => {
    if (tab === "draw") {
      if (isEmpty) return null;
      return canvasRef.current?.toDataURL("image/png") ?? null;
    }
    if (!typedSig.trim()) return null;
    const offscreen = document.createElement("canvas");
    offscreen.width = 500; offscreen.height = 150;
    const ctx = offscreen.getContext("2d")!;
    ctx.clearRect(0, 0, 500, 150);
    ctx.font = `64px ${FONTS[fontIdx]}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(typedSig, 250, 75);
    return offscreen.toDataURL("image/png");
  }, [tab, isEmpty, typedSig, fontIdx, color]);

  const handlePdfFile = async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setPdfFile(f); setDone(false); setError("");
    const buf = await f.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    setTotalPages(pdf.getPageCount());
    setPageNum(1);
  };

  const embedSignature = async () => {
    if (!pdfFile) { setError("Please upload a PDF."); return; }
    const sigUrl = getSignatureDataUrl();
    if (!sigUrl) { setError("Please draw or type your signature first."); return; }
    setLoading(true); setError(""); setDone(false);
    try {
      const buf = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const pages = pdf.getPages();
      const page = pages[pageNum - 1];
      const { width, height } = page.getSize();

      const base64 = sigUrl.split(",")[1];
      const img = await pdf.embedPng(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));

      const sigW = (width * scale) / 100;
      const sigH = (sigW * img.height) / img.width;

      const margin = 20;
      let x = margin, y = margin;
      if      (position === "top-right")    { x = width - sigW - margin; y = height - sigH - margin; }
      else if (position === "top-left")     { x = margin;                y = height - sigH - margin; }
      else if (position === "center")       { x = (width - sigW) / 2;   y = (height - sigH) / 2; }
      else if (position === "bottom-left")  { x = margin;                y = margin; }
      else if (position === "bottom-right") { x = width - sigW - margin; y = margin; }

      page.drawImage(img, { x, y, width: sigW, height: sigH });
      const saved = await pdf.save();
      triggerDownload(new Blob([saved], { type: "application/pdf" }), pdfFile.name.replace(".pdf", "-signed.pdf"));
      setDone(true); increment();
    } catch { setError("Failed to embed signature. Please try again."); }
    finally { setLoading(false); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <PenLine className="w-3.5 h-3.5" />
          <span>E-Signature</span>
          <UsageCount count={count} label="signature" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">E-Signature</h1>
        <p className="text-muted-foreground mt-2">Draw or type your signature and embed it into any PDF — 100% in your browser, nothing uploaded.</p>
      </div>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 text-xs">
          {shareCopied ? <><Upload className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Link2 className="w-3.5 h-3.5" />Share</>}
        </Button>
      </div>

      {/* Signature pad */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab("draw")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === "draw" ? "bg-primary text-primary-foreground shadow" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
            <PenLine className="w-4 h-4" />Draw
          </button>
          <button onClick={() => setTab("type")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === "type" ? "bg-primary text-primary-foreground shadow" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
            <Type className="w-4 h-4" />Type
          </button>
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">Color:</span>
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? "border-foreground scale-110" : "border-transparent scale-100"}`} style={{ background: c }} />
          ))}
          {tab === "draw" && (
            <>
              <span className="text-xs text-muted-foreground font-medium ml-2">Thickness:</span>
              <input type="range" min={1} max={8} value={strokeW} onChange={(e) => setStrokeW(Number(e.target.value))} className="w-20 accent-primary" />
            </>
          )}
        </div>

        {tab === "draw" ? (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={560}
              height={180}
              className="w-full rounded-xl border-2 border-dashed border-border bg-white touch-none cursor-crosshair"
              style={{ maxHeight: 180 }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-muted-foreground/50 text-sm">Sign here with mouse or touch</span>
              </div>
            )}
            <button onClick={clearCanvas} className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 border border-border text-muted-foreground hover:text-foreground transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={typedSig}
              onChange={(e) => setTypedSig(e.target.value)}
              placeholder="Type your name here..."
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ fontFamily: FONTS[fontIdx], color }}
            />
            <div className="flex gap-2 flex-wrap">
              {FONT_NAMES.map((name, i) => (
                <button key={i} onClick={() => setFontIdx(i)} className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${fontIdx === i ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/50"}`} style={{ fontFamily: FONTS[i] }}>
                  {name}
                </button>
              ))}
            </div>
            {typedSig && (
              <div className="rounded-xl border border-border bg-white p-4 text-center" style={{ fontFamily: FONTS[fontIdx], fontSize: 40, color }}>
                {typedSig}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF settings */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
        <h2 className="font-semibold text-foreground">PDF Settings</h2>

        {/* Position */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Signature position on page</label>
          <div className="grid grid-cols-3 gap-2">
            {["top-left","top-right","center","bottom-left","bottom-right"].map((p) => (
              <button key={p} onClick={() => setPosition(p as Position)} className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${position === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {p.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Signature size — <span className="text-primary">{scale}% of page width</span></label>
          <input type="range" min={10} max={60} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full accent-primary" />
        </div>

        {/* Page */}
        {totalPages > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Apply to page</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setPageNum((p) => Math.max(1, p - 1))} disabled={pageNum === 1} className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-mono">Page {pageNum} / {totalPages}</span>
              <button onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))} disabled={pageNum === totalPages} className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Upload PDF */}
        {!pdfFile ? (
          <div
            onClick={() => pdfRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer py-10"
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Upload PDF to sign</p>
              <p className="text-xs text-muted-foreground mt-1">Click or drag & drop</p>
            </div>
            <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handlePdfFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{pdfFile.name}</p>
                <p className="text-xs text-muted-foreground">{totalPages} page{totalPages > 1 ? "s" : ""}</p>
              </div>
            </div>
            <button onClick={() => { setPdfFile(null); setDone(false); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2">{error}</p>}
        {done  && <p className="text-sm text-emerald-600 bg-emerald-500/10 rounded-lg px-4 py-2">✓ Signed PDF downloaded!</p>}

        <Button onClick={embedSignature} disabled={loading} className="w-full">
          {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Embedding signature...</> : <><Download className="w-4 h-4 mr-2" />Sign & Download PDF</>}
        </Button>
      </div>
    </div>
  );
}
