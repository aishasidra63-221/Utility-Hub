import { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useShareURL } from "@/hooks/useShareURL";
import { useToolCounter } from "@/hooks/useToolCounter";

const SIZES: Record<string, number> = { Small: 200, Medium: 300, Large: 400 };

export default function QrGenerator() {
  useSEO({
    title: "Free QR Code Generator — Create QR Codes Instantly | ToolsHub",
    description:
      "Generate a QR code for any URL or text for free. Instant preview, download as PNG. No signup needed.",
  });

  const { initialValues, updateParams, copyShareLink, copied: linkCopied } = useShareURL({
    text: "https://",
    size: "Medium",
  });

  const { count, increment } = useToolCounter("qr-generator");

  const [text, setText] = useState(initialValues.text);
  const [size, setSize] = useState<keyof typeof SIZES>(
    (initialValues.size as keyof typeof SIZES) in SIZES ? (initialValues.size as keyof typeof SIZES) : "Medium"
  );
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback(() => {
    if (!canvasRef.current || !text.trim()) return;
    QRCode.toCanvas(canvasRef.current, text, {
      width: SIZES[size],
      errorCorrectionLevel: "M",
      margin: 2,
    }).catch(() => {});
  }, [text, size]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      generate();
      updateParams({ text, size });
    }, 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [generate, updateParams, text, size]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      a.click();
      URL.revokeObjectURL(url);
      increment(); // count each download
    }, "image/png");
  };

  const copyText = async () => {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="relative">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Tools</span>
              <UsageCount count={count} label="QR generated" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">QR Code Generator</h1>
            <p className="text-muted-foreground mt-2">
              Turn any URL or text into a scannable QR code instantly. Download as PNG.
            </p>
          </div>
          <div className="absolute top-0 right-0">
            <ShareButton onCopy={copyShareLink} copied={linkCopied} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="qr-input" className="text-sm font-medium text-foreground">
              URL or text
            </label>
            <textarea
              id="qr-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL or text..."
              data-testid="input-qr-text"
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Size</label>
            <div className="flex gap-2">
              {Object.keys(SIZES).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s as keyof typeof SIZES)}
                  data-testid={`button-size-${s.toLowerCase()}`}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    size === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {s}
                  <span className="block text-[10px] opacity-60">{SIZES[s]}px</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={download}
              disabled={!text.trim()}
              data-testid="button-download-qr"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            <Button
              variant="outline"
              onClick={copyText}
              disabled={!text.trim()}
              data-testid="button-copy-text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl p-6 min-h-[300px]">
          {text.trim() ? (
            <>
              <canvas
                ref={canvasRef}
                data-testid="canvas-qr"
                className="rounded-lg max-w-full"
                style={{ imageRendering: "pixelated" }}
              />
              <p className="text-xs text-muted-foreground mt-3 text-center max-w-[200px] truncate">
                {text}
              </p>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <QrCode className="w-16 h-16 mx-auto opacity-20 mb-3" />
              <p className="text-sm">Enter text above to generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
