import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { FileText, Upload, Download, X, RefreshCw, Image, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

type Mode = "pdf-to-images" | "images-to-pdf";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

async function pdfToImages(file: File, onProgress?: (p: number) => void): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL("image/png"));
    if (onProgress) onProgress(Math.round((i / pdf.numPages) * 100));
  }
  return images;
}

function imagesToPdf(dataUrls: string[], filenames: string[]): void {
  const pdf = new jsPDF({ orientation: "portrait", unit: "px" });
  let firstPage = true;

  dataUrls.forEach((dataUrl, idx) => {
    const img = document.createElement("img");
    img.src = dataUrl;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const imgWidth = 595;
    const imgHeight = canvas.height * (imgWidth / (canvas.width || 1));

    if (!firstPage) {
      pdf.addPage([imgWidth, imgHeight], imgHeight > imgWidth ? "portrait" : "landscape");
    } else {
      firstPage = false;
      pdf.internal.pageSize.width = imgWidth;
      pdf.internal.pageSize.height = imgHeight;
    }

    pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
    void filenames[idx];
  });

  pdf.save("converted.pdf");
}

export default function PdfConverter() {
  useSEO({
    title: "Free PDF to Image Converter & Images to PDF Online | ToolsHub",
    description:
      "Convert PDF pages to PNG images, or combine multiple images into a single PDF. Free, browser-based, no file upload to servers.",
  });

  const [mode, setMode] = useState<Mode>("pdf-to-images");
  const [shareCopied, setShareCopied] = useState(false);

  // PDF to Images state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfError, setPdfError] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Images to PDF state
  const [imgFiles, setImgFiles] = useState<File[]>([]);
  const [imgPreviews, setImgPreviews] = useState<string[]>([]);
  const [pdfBuilding, setPdfBuilding] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  // --- PDF to Images ---
  const handlePdfFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setPdfFile(f);
    setPdfImages([]);
    setPdfError("");
  };

  const convertPdfToImages = async () => {
    if (!pdfFile) return;
    setPdfLoading(true);
    setPdfProgress(0);
    setPdfError("");
    try {
      const images = await pdfToImages(pdfFile, setPdfProgress);
      setPdfImages(images);
    } catch (e) {
      setPdfError("Failed to convert PDF. Make sure it is a valid PDF file.");
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadPdfPage = (dataUrl: string, pageNum: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `page-${pageNum}.png`;
    a.click();
  };

  // --- Images to PDF ---
  const handleImgFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setImgFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImgPreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const removeImg = (idx: number) => {
    setImgFiles((prev) => prev.filter((_, i) => i !== idx));
    setImgPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildPdf = async () => {
    if (!imgPreviews.length) return;
    setPdfBuilding(true);
    try {
      imagesToPdf(imgPreviews, imgFiles.map((f) => f.name));
    } finally {
      setPdfBuilding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Tools</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">PDF Converter</h1>
            <p className="text-muted-foreground mt-2">
              Convert PDF pages to images, or combine images into a PDF. All processing happens in your browser.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLink}
            data-testid="button-share-link"
            className="gap-2 text-xs"
          >
            {shareCopied ? (
              <>
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                Link copied!
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                Share this tool
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-xl border border-border bg-muted/30 p-1 mb-8 w-fit gap-1">
        {(["pdf-to-images", "images-to-pdf"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            data-testid={`tab-${m}`}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "pdf-to-images" ? "PDF to Images" : "Images to PDF"}
          </button>
        ))}
      </div>

      {/* PDF to Images */}
      {mode === "pdf-to-images" && (
        <div className="space-y-6">
          {!pdfFile ? (
            <div
              onClick={() => pdfInputRef.current?.click()}
              data-testid="dropzone-pdf"
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Click to upload a PDF file</p>
              <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                data-testid="input-pdf-file"
                onChange={(e) => e.target.files?.[0] && handlePdfFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{pdfFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(pdfFile.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setPdfFile(null); setPdfImages([]); setPdfError(""); }}
                  data-testid="button-remove-pdf"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {pdfError && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
                  {pdfError}
                </div>
              )}

              <Button
                onClick={convertPdfToImages}
                disabled={pdfLoading}
                data-testid="button-convert-pdf"
              >
                {pdfLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Converting... {pdfProgress}%
                  </>
                ) : (
                  "Convert to Images"
                )}
              </Button>

              {pdfImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">{pdfImages.length} page{pdfImages.length > 1 ? "s" : ""} extracted</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {pdfImages.map((src, i) => (
                      <div key={i} className="group relative rounded-lg border border-border overflow-hidden">
                        <img src={src} alt={`Page ${i + 1}`} className="w-full object-cover" data-testid={`img-pdf-page-${i + 1}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadPdfPage(src, i + 1)}
                            data-testid={`button-download-page-${i + 1}`}
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            Page {i + 1}
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                          Page {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Images to PDF */}
      {mode === "images-to-pdf" && (
        <div className="space-y-6">
          <div
            onClick={() => imgInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); handleImgFiles(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            data-testid="dropzone-images"
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">Drop images here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — multiple files allowed</p>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              data-testid="input-images-for-pdf"
              onChange={(e) => e.target.files && handleImgFiles(e.target.files)}
            />
          </div>

          {imgPreviews.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {imgPreviews.length} image{imgPreviews.length > 1 ? "s" : ""} selected
                </p>
                <Button variant="ghost" size="sm" onClick={() => { setImgFiles([]); setImgPreviews([]); }}>
                  Clear all
                </Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {imgPreviews.map((src, i) => (
                  <div key={i} className="relative group rounded-lg border border-border overflow-hidden aspect-square">
                    <img src={src} alt={imgFiles[i]?.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImg(i)}
                      data-testid={`button-remove-img-${i}`}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                onClick={buildPdf}
                disabled={pdfBuilding}
                data-testid="button-build-pdf"
              >
                {pdfBuilding ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Building PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
