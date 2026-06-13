import { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { Link } from "wouter";
import {
  Highlighter, Pen, Type, Eraser, Download, Upload, X,
  RefreshCw, FileText, Trash2, Link2, Minus, Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

type Tool = "highlight" | "pen" | "arrow" | "text" | "eraser";
const HIGHLIGHT_COLORS = ["#FFD60A", "#4ADE80", "#60A5FA", "#F87171", "#C084FC"];
const PEN_COLORS = ["#000000", "#1d4ed8", "#dc2626", "#15803d", "#7c3aed"];

interface Annotation {
  type: Tool;
  points?: { x: number; y: number }[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  text?: string;
  color: string;
  width?: number;
  opacity?: number;
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function PdfAnnotator() {
  useSEO({ title: "PDF Annotator — Highlight & Draw — ToolsHub", description: "Highlight text, draw, and annotate PDF pages in your browser. No upload, 100% private." });
  const { count, increment } = useToolCounter("pdf-annotator");

  const [file, setFile]         = useState<File | null>(null);
  const [pageNum, setPageNum]   = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [tool, setTool]         = useState<Tool>("highlight");
  const [color, setColor]       = useState(HIGHLIGHT_COLORS[0]);
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [strokeW, setStrokeW]   = useState(3);
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos]   = useState<{ x: number; y: number } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const pdfRef    = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const currentPath = useRef<{ x: number; y: number }[]>([]);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const pdfDocRef = useRef<pdfjs.PDFDocumentProxy | null>(null);

  const renderPage = useCallback(async (num: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    setLoading(true);
    const page = await pdfDocRef.current.getPage(num);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    if (overlayRef.current) {
      overlayRef.current.width = viewport.width;
      overlayRef.current.height = viewport.height;
    }
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    setLoading(false);
    redrawAnnotations(num);
  }, []);

  const redrawAnnotations = useCallback((num: number) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d")!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    const anns = annotations[num] ?? [];
    for (const ann of anns) {
      if (ann.type === "highlight" && ann.start && ann.end) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = ann.color;
        ctx.fillRect(ann.start.x, ann.start.y, ann.end.x - ann.start.x, ann.end.y - ann.start.y);
        ctx.globalAlpha = 1;
      } else if ((ann.type === "pen" || ann.type === "eraser") && ann.points && ann.points.length > 1) {
        ctx.globalCompositeOperation = ann.type === "eraser" ? "destination-out" : "source-over";
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.width ?? 3;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (const pt of ann.points.slice(1)) ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      } else if (ann.type === "arrow" && ann.start && ann.end) {
        drawArrow(ctx, ann.start, ann.end, ann.color, ann.width ?? 2);
      } else if (ann.type === "text" && ann.start && ann.text) {
        ctx.font = "16px sans-serif";
        ctx.fillStyle = ann.color;
        ctx.fillText(ann.text, ann.start.x, ann.start.y);
      }
    }
  }, [annotations]);

  useEffect(() => { redrawAnnotations(pageNum); }, [annotations, pageNum, redrawAnnotations]);

  function drawArrow(ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, clr: string, lw: number) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const len = 14;
    ctx.strokeStyle = clr; ctx.fillStyle = clr; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - len * Math.cos(angle - 0.4), to.y - len * Math.sin(angle - 0.4));
    ctx.lineTo(to.x - len * Math.cos(angle + 0.4), to.y - len * Math.sin(angle + 0.4));
    ctx.closePath(); ctx.fill();
  }

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    const scaleX = overlayRef.current!.width / rect.width;
    const scaleY = overlayRef.current!.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === "text") {
      const pos = getPos(e);
      setTextPos(pos);
      return;
    }
    drawing.current = true;
    const pos = getPos(e);
    startPoint.current = pos;
    currentPath.current = [pos];
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const overlay = overlayRef.current!;
    const ctx = overlay.getContext("2d")!;

    if (tool === "pen" || tool === "eraser") {
      currentPath.current.push(pos);
      redrawAnnotations(pageNum);
      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : penColor;
      ctx.lineWidth = strokeW;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      const pts = currentPath.current;
      if (pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
    } else if ((tool === "highlight" || tool === "arrow") && startPoint.current) {
      redrawAnnotations(pageNum);
      if (tool === "highlight") {
        ctx.globalAlpha = 0.4; ctx.fillStyle = color;
        ctx.fillRect(startPoint.current.x, startPoint.current.y, pos.x - startPoint.current.x, pos.y - startPoint.current.y);
        ctx.globalAlpha = 1;
      } else {
        drawArrow(ctx, startPoint.current, pos, penColor, strokeW);
      }
    }
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    drawing.current = false;
    const pos = getPos(e);
    const newAnn: Annotation = { type: tool, color: tool === "pen" || tool === "eraser" || tool === "arrow" ? penColor : color, width: strokeW };

    if (tool === "pen" || tool === "eraser") {
      newAnn.points = [...currentPath.current];
    } else if (tool === "highlight" && startPoint.current) {
      newAnn.start = startPoint.current; newAnn.end = pos;
    } else if (tool === "arrow" && startPoint.current) {
      newAnn.start = startPoint.current; newAnn.end = pos;
    }

    setAnnotations((prev) => ({ ...prev, [pageNum]: [...(prev[pageNum] ?? []), newAnn] }));
    currentPath.current = [];
    startPoint.current = null;
  };

  const handleTextSubmit = () => {
    if (!textPos || !textInput.trim()) { setTextPos(null); return; }
    const ann: Annotation = { type: "text", color: penColor, start: textPos, text: textInput.trim() };
    setAnnotations((prev) => ({ ...prev, [pageNum]: [...(prev[pageNum] ?? []), ann] }));
    setTextInput(""); setTextPos(null);
  };

  const undoLast = () => {
    setAnnotations((prev) => {
      const list = [...(prev[pageNum] ?? [])];
      list.pop();
      return { ...prev, [pageNum]: list };
    });
  };

  const clearPage = () => setAnnotations((prev) => ({ ...prev, [pageNum]: [] }));

  const handlePdfFile = async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setFile(f); setAnnotations({}); setDone(false); setError(""); setPageNum(1);
    const buf = await f.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    pdfDocRef.current = doc;
    setTotalPages(doc.numPages);
    await renderPage(1);
  };

  useEffect(() => { if (file) renderPage(pageNum); }, [pageNum]);

  const savePdf = async () => {
    if (!file || !canvasRef.current || !overlayRef.current) return;
    setSaving(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const pages = pdf.getPages();

      for (let i = 1; i <= totalPages; i++) {
        const anns = annotations[i];
        if (!anns || anns.length === 0) continue;

        await renderPage(i);
        await new Promise((r) => setTimeout(r, 300));

        const merged = document.createElement("canvas");
        merged.width = canvasRef.current!.width;
        merged.height = canvasRef.current!.height;
        const mCtx = merged.getContext("2d")!;
        mCtx.drawImage(canvasRef.current!, 0, 0);
        mCtx.drawImage(overlayRef.current!, 0, 0);

        const imgData = merged.toDataURL("image/png");
        const base64 = imgData.split(",")[1];
        const img = await pdf.embedPng(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
        const page = pages[i - 1];
        const { width, height } = page.getSize();
        page.drawImage(img, { x: 0, y: 0, width, height });
      }

      const saved = await pdf.save();
      triggerDownload(new Blob([saved], { type: "application/pdf" }), file.name.replace(".pdf", "-annotated.pdf"));
      setDone(true); increment();
    } catch { setError("Failed to save annotated PDF. Please try again."); }
    finally { setSaving(false); await renderPage(pageNum); }
  };

  const activeColor = tool === "highlight" ? color : penColor;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Highlighter className="w-3.5 h-3.5" />
          <span>PDF Annotator</span>
          <UsageCount count={count} label="annotation" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">PDF Annotator</h1>
        <p className="text-muted-foreground mt-2">Highlight, draw, add text and arrows on PDF pages — runs in your browser, nothing uploaded.</p>
      </div>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }} className="gap-2 text-xs">
          {shareCopied ? <><Upload className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Link2 className="w-3.5 h-3.5" />Share</>}
        </Button>
      </div>

      {!file ? (
        <div
          onClick={() => pdfRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handlePdfFile(f); }}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer py-16"
        >
          <Highlighter className="w-10 h-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Upload PDF to annotate</p>
            <p className="text-xs text-muted-foreground mt-1">Click or drag & drop</p>
          </div>
          <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handlePdfFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border bg-card shadow-sm">
            {/* Tools */}
            {([
              { id: "highlight", icon: Highlighter, label: "Highlight" },
              { id: "pen",       icon: Pen,         label: "Pen" },
              { id: "arrow",     icon: Minus,        label: "Arrow" },
              { id: "text",      icon: Type,         label: "Text" },
              { id: "eraser",    icon: Eraser,       label: "Eraser" },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTool(id)} title={label} className={`p-2 rounded-lg transition-all ${tool === id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}

            <div className="w-px h-6 bg-border mx-1" />

            {/* Colors */}
            {(tool === "highlight" ? HIGHLIGHT_COLORS : PEN_COLORS).map((c) => (
              <button key={c} onClick={() => tool === "highlight" ? setColor(c) : setPenColor(c)} className={`w-5 h-5 rounded-full border-2 transition-transform ${activeColor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ background: c }} />
            ))}

            {tool !== "highlight" && (
              <>
                <div className="w-px h-6 bg-border mx-1" />
                <input type="range" min={1} max={10} value={strokeW} onChange={(e) => setStrokeW(Number(e.target.value))} className="w-16 accent-primary" title="Stroke width" />
              </>
            )}

            <div className="flex-1" />

            {/* Undo / Clear */}
            <button onClick={undoLast} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Undo last">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={clearPage} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Clear page">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => { setFile(null); pdfDocRef.current = null; setTotalPages(0); setAnnotations({}); }} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Remove file">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Page nav */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button disabled={pageNum === 1} onClick={() => setPageNum((p) => p - 1)} className="px-3 py-1 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors">←</button>
              <span className="text-sm text-muted-foreground">Page {pageNum} / {totalPages}</span>
              <button disabled={pageNum === totalPages} onClick={() => setPageNum((p) => p + 1)} className="px-3 py-1 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors">→</button>
            </div>
          )}

          {/* Canvas area */}
          <div className="relative rounded-xl overflow-auto border border-border bg-muted/30 flex justify-center">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-20">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            <div className="relative inline-block">
              <canvas ref={canvasRef} className="block max-w-full" />
              <canvas
                ref={overlayRef}
                className="absolute inset-0 w-full h-full touch-none"
                style={{ cursor: tool === "eraser" ? "cell" : tool === "text" ? "text" : "crosshair", opacity: 1 }}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={() => { if (drawing.current) handlePointerUp({} as React.MouseEvent); }}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              />
            </div>
          </div>

          {/* Text input popup */}
          {textPos && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card shadow-md">
              <input autoFocus value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()} placeholder="Type text, press Enter..." className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <Button size="sm" onClick={handleTextSubmit}>Add</Button>
              <button onClick={() => { setTextPos(null); setTextInput(""); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
          )}

          {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2">{error}</p>}
          {done  && <p className="text-sm text-emerald-600 bg-emerald-500/10 rounded-lg px-4 py-2">✓ Annotated PDF downloaded!</p>}

          <Button onClick={savePdf} disabled={saving} className="w-full">
            {saving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving PDF...</> : <><Download className="w-4 h-4 mr-2" />Download Annotated PDF</>}
          </Button>
        </div>
      )}
    </div>
  );
}
