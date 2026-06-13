import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { MessageCircle, Copy, Check, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useShareURL } from "@/hooks/useShareURL";
import { useToolCounter } from "@/hooks/useToolCounter";

function buildLink(phone: string, message: string): string {
  const clean = phone.replace(/[^\d+]/g, "");
  if (!clean) return "";
  const base = `https://wa.me/${clean.replace(/^\+/, "")}`;
  if (message.trim()) {
    return `${base}?text=${encodeURIComponent(message.trim())}`;
  }
  return base;
}

export default function WhatsappLink() {
  useSEO({
    title: "WhatsApp Link Generator — Create wa.me Links with QR Code | ToolsHub",
    description:
      "Generate a direct WhatsApp chat link with an optional pre-filled message. Also creates a QR code. Free, instant, no signup.",
  });

  const { initialValues, updateParams, copyShareLink, copied: linkCopied } = useShareURL({
    phone: "",
    msg: "",
  });

  const { count, increment } = useToolCounter("whatsapp-link");

  const [phone, setPhone] = useState(initialValues.phone);
  const [message, setMessage] = useState(initialValues.msg);
  const [copiedLink, setCopiedLink] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const link = buildLink(phone, message);

  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      updateParams({ phone, msg: message });
    }, 400);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [phone, message, updateParams]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!link) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = 256;
        canvasRef.current.height = 256;
        ctx.clearRect(0, 0, 256, 256);
      }
      return;
    }
    QRCode.toCanvas(canvasRef.current, link, {
      width: 256,
      errorCorrectionLevel: "M",
      margin: 2,
    }).catch(() => {});
  }, [link]);

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    increment(); // count each link copy
  };

  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas || !link) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "whatsapp-qr.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="relative">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Tools</span>
              <UsageCount count={count} label="link created" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">WhatsApp Link Generator</h1>
            <p className="text-muted-foreground mt-2">
              Create a direct chat link with an optional message. Generates a QR code automatically.
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
            <label htmlFor="wa-phone" className="text-sm font-medium text-foreground">
              Phone number
            </label>
            <input
              id="wa-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              data-testid="input-phone"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            />
            <p className="text-xs text-muted-foreground">Include country code, e.g. +1 for US</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="wa-message" className="text-sm font-medium text-foreground">
              Pre-filled message <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="wa-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'd like to get in touch..."
              data-testid="input-message"
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {link && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Generated link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  data-testid="output-wa-link"
                  className="flex-1 rounded-lg border border-input bg-muted/30 px-3 py-2 text-xs font-mono text-muted-foreground truncate"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                  data-testid="button-copy-link"
                  title="Copy link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {link && (
              <>
                <Button
                  asChild
                  data-testid="button-open-whatsapp"
                  className="flex-1 sm:flex-none"
                  onClick={() => increment()} // count opening WhatsApp too
                >
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadQr}
                  data-testid="button-download-wa-qr"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl p-6 min-h-[280px]">
          {link ? (
            <>
              <canvas
                ref={canvasRef}
                data-testid="canvas-wa-qr"
                className="rounded-lg max-w-full"
              />
              <p className="text-xs text-muted-foreground mt-3">Scan to open WhatsApp</p>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto opacity-20 mb-3" />
              <p className="text-sm">Enter a phone number to generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
