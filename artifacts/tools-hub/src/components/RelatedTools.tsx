import { Link } from "wouter";
import { ArrowRight, TrendingUp, Sparkles,
  Image, ArrowLeftRight, Maximize2, Crop, Palette, Smartphone,
  FileText, PenLine, Highlighter, ScanText, Key, QrCode,
  MessageCircle, Ruler, AlignLeft, FileUser, Eraser, BookOpen,
  Film, Timer, ShieldCheck, Pipette, ZoomIn, Droplets, EyeOff,
  FileSpreadsheet, Activity, Calculator, Braces, Lock, type LucideIcon,
} from "lucide-react";
import { TOOL_BY_HREF, POPULAR_TOOL_HREFS } from "@/lib/toolsData";

const TOOL_ICONS: Record<string, LucideIcon> = {
  "/image-compressor":   Image,
  "/image-converter":    ArrowLeftRight,
  "/image-resizer":      Maximize2,
  "/image-cropper":      Crop,
  "/color-palette":      Palette,
  "/heic-converter":     Smartphone,
  "/pdf-converter":      FileText,
  "/e-signature":        PenLine,
  "/pdf-annotator":      Highlighter,
  "/ocr-tool":           ScanText,
  "/password-generator": Key,
  "/qr-generator":       QrCode,
  "/whatsapp-link":      MessageCircle,
  "/unit-converter":     Ruler,
  "/text-cleaner":       AlignLeft,
  "/resume-builder":     FileUser,
  "/background-remover": Eraser,
  "/word-counter":       BookOpen,
  "/video-to-gif":       Film,
  "/pomodoro-timer":     Timer,
  "/exif-stripper":      ShieldCheck,
  "/color-picker":       Pipette,
  "/image-upscaler":     ZoomIn,
  "/photo-colorizer":    Palette,
  "/watermark-remover":  Droplets,
  "/face-blur":          EyeOff,
  "/csv-explorer":       FileSpreadsheet,
  "/bmi-calculator":     Activity,
  "/emi-calculator":     Calculator,
  "/json-explorer":      Braces,
  "/base64":             Lock,
};

function ToolMiniCard({ href, currentHref }: { href: string; currentHref?: string }) {
  const tool = TOOL_BY_HREF.get(href);
  if (!tool || href === currentHref) return null;
  const IconComponent = TOOL_ICONS[href] ?? FileText;
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all duration-150"
    >
      <div className={`w-9 h-9 rounded-lg ${tool.iconBg} flex-shrink-0 flex items-center justify-center`}>
        <IconComponent className="w-4.5 h-4.5 text-white" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground truncate leading-tight">{tool.title}</p>
        <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-tight">
          {tool.tagline.split("—")[0].trim()}
        </p>
      </div>
      <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

interface RelatedToolsProps {
  currentHref: string;
  relatedHrefs: string[];
}

export function RelatedTools({ currentHref, relatedHrefs }: RelatedToolsProps) {
  const validRelated = relatedHrefs
    .filter((h) => h !== currentHref && TOOL_BY_HREF.has(h))
    .slice(0, 3);

  const popularHrefs = POPULAR_TOOL_HREFS
    .filter((h) => h !== currentHref && !validRelated.includes(h))
    .slice(0, 3);

  const hasRelated = validRelated.length > 0;
  const hasPopular = popularHrefs.length > 0;

  if (!hasRelated && !hasPopular) return null;

  return (
    <div className="border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {hasRelated && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Related Tools</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {validRelated.map((href) => (
                <ToolMiniCard key={href} href={href} currentHref={currentHref} />
              ))}
            </div>
          </section>
        )}

        {hasPopular && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Popular Tools</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {popularHrefs.map((href) => (
                <ToolMiniCard key={href} href={href} currentHref={currentHref} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
