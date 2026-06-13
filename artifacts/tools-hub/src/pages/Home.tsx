import { useState, useEffect, useMemo, memo } from "react";
import { Link } from "wouter";
import {
  Image, FileText, QrCode, AlignLeft, MessageCircle,
  ArrowRight, Activity, Star, ArrowLeftRight, Maximize2,
  ShieldCheck, Zap, Globe, Smartphone, Crop, Key, Palette, Ruler,
  Check, X, Trophy,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { getAllToolCounts } from "@/hooks/useToolCounter";

const ALL_TOOLS = [
  {
    href: "/image-compressor",
    id: "image-compressor",
    icon: Image,
    title: "Image Compressor",
    description: "Compress JPG, PNG, and WebP images instantly in your browser. Reduce file size while keeping quality.",
    badge: "Browser-only",
    gradient: "from-blue-500/15 to-cyan-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30",
    accentColor: "group-hover:text-blue-500",
  },
  {
    href: "/image-converter",
    id: "image-converter",
    icon: ArrowLeftRight,
    title: "Image Converter",
    description: "Convert JPG, PNG, and WebP formats in bulk. Change format and quality, download all as ZIP.",
    badge: "Batch",
    gradient: "from-pink-500/15 to-rose-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30",
    accentColor: "group-hover:text-pink-500",
  },
  {
    href: "/image-resizer",
    id: "image-resizer",
    icon: Maximize2,
    title: "Image Resizer",
    description: "Resize images to any dimension — HD, Full HD, Instagram, custom. Batch resize with aspect ratio lock.",
    badge: "Presets",
    gradient: "from-cyan-500/15 to-teal-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/30",
    accentColor: "group-hover:text-cyan-500",
  },
  {
    href: "/image-cropper",
    id: "image-cropper",
    icon: Crop,
    title: "Image Cropper",
    description: "Drag to crop any area. Free crop, 1:1, 4:3, 16:9 and more. Download the exact region you need.",
    badge: "Drag & crop",
    gradient: "from-sky-500/15 to-indigo-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/30",
    accentColor: "group-hover:text-sky-500",
  },
  {
    href: "/password-generator",
    id: "password-generator",
    icon: Key,
    title: "Password Generator",
    description: "Generate strong, random passwords. Choose length, symbols, numbers. Cryptographically secure — nothing leaves your browser.",
    badge: "Secure",
    gradient: "from-emerald-500/15 to-green-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30",
    accentColor: "group-hover:text-emerald-500",
  },
  {
    href: "/unit-converter",
    id: "unit-converter",
    icon: Ruler,
    title: "Unit Converter",
    description: "Convert length, weight, temperature, volume, area, and speed. Instant results with a full reference table.",
    badge: "6 categories",
    gradient: "from-violet-500/15 to-indigo-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30",
    accentColor: "group-hover:text-violet-500",
  },
  {
    href: "/color-palette",
    id: "color-palette",
    icon: Palette,
    title: "Color Palette Extractor",
    description: "Upload any image and extract its dominant colors as hex codes. Copy instantly. Perfect for designers.",
    badge: "For designers",
    gradient: "from-fuchsia-500/15 to-pink-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/30",
    accentColor: "group-hover:text-fuchsia-500",
  },
  {
    href: "/heic-converter",
    id: "heic-converter",
    icon: Smartphone,
    title: "HEIC to JPG",
    description: "Convert iPhone HEIC photos to JPG instantly. Batch convert, download as ZIP. Works 100% in your browser.",
    badge: "iPhone photos",
    gradient: "from-orange-500/15 to-amber-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30",
    accentColor: "group-hover:text-orange-500",
  },
  {
    href: "/pdf-converter",
    id: "pdf-converter",
    icon: FileText,
    title: "PDF Tools",
    description: "Convert PDF pages to images, or stitch multiple images into a single PDF. No upload to any server.",
    badge: "Two-way",
    gradient: "from-red-500/15 to-rose-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30",
    accentColor: "group-hover:text-red-500",
  },
  {
    href: "/qr-generator",
    id: "qr-generator",
    icon: QrCode,
    title: "QR Code Generator",
    description: "Generate a QR code for any URL or text instantly. Download as PNG in seconds.",
    badge: "Instant",
    gradient: "from-teal-500/15 to-emerald-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/30",
    accentColor: "group-hover:text-teal-500",
  },
  {
    href: "/text-cleaner",
    id: "text-cleaner",
    icon: AlignLeft,
    title: "Text Cleaner",
    description: "Remove extra spaces, normalize line breaks, change case, and strip emojis from messy text.",
    badge: "Live preview",
    gradient: "from-orange-500/15 to-yellow-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30",
    accentColor: "group-hover:text-orange-500",
  },
  {
    href: "/whatsapp-link",
    id: "whatsapp-link",
    icon: MessageCircle,
    title: "WhatsApp Link",
    description: "Create a direct WhatsApp chat link with a pre-filled message. Also generates a scannable QR code.",
    badge: "With QR",
    gradient: "from-green-500/15 to-lime-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-green-500 to-lime-600 shadow-lg shadow-green-500/30",
    accentColor: "group-hover:text-green-500",
  },
];

const FEATURES = [
  { icon: ShieldCheck, label: "100% Private", sub: "Nothing leaves your browser" },
  { icon: Zap,         label: "Instant Results", sub: "No waiting, no queues" },
  { icon: Globe,       label: "Free Forever", sub: "No paywalls, no signup" },
  { icon: Smartphone,  label: "Works Everywhere", sub: "Desktop & mobile" },
];

const ToolCard = memo(function ToolCard({
  tool,
  count,
  isFavourite,
}: {
  tool: (typeof ALL_TOOLS)[number];
  count: number;
  isFavourite: boolean;
}) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      data-testid={`card-tool-${tool.href.slice(1)}`}
      className="group relative flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card card-glow overflow-hidden"
    >
      {/* Subtle gradient wash on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      {isFavourite && (
        <span className="absolute top-3 right-3 text-primary opacity-30 group-hover:opacity-70 transition-opacity z-10">
          <Star className="w-3.5 h-3.5 fill-current" />
        </span>
      )}

      <div className="relative flex items-start justify-between z-10">
        <div className={`p-2.5 rounded-xl ${tool.iconBg}`}>
          <Icon className={`w-5 h-5 ${tool.iconColor}`} />
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span
              className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
              data-testid={`text-usage-count-${tool.id}`}
            >
              {count}×
            </span>
          )}
          <span className="text-xs font-medium text-muted-foreground bg-muted/80 px-2.5 py-0.5 rounded-full border border-border">
            {tool.badge}
          </span>
        </div>
      </div>

      <div className="relative flex-1 z-10">
        <h2 className={`text-base font-semibold text-foreground mb-1.5 transition-colors duration-200 ${tool.accentColor}`}>
          {tool.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="relative flex items-center gap-1 text-xs font-semibold text-primary mt-auto z-10">
        Open tool
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1.5" />
      </div>
    </Link>
  );
});

export default function Home() {
  useSEO({
    title: "ToolsHub — Free Online Tools, No Signup",
    description:
      "Free online tools: compress images, convert PDFs, generate QR codes, clean text, and create WhatsApp links. No signup, no ads, instant results.",
  });

  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setCounts(getAllToolCounts());
    const handler = () => setCounts(getAllToolCounts());
    window.addEventListener("toolhub_count_updated", handler);
    return () => window.removeEventListener("toolhub_count_updated", handler);
  }, []);

  const totalUses = Object.values(counts).reduce((a, b) => a + b, 0);
  const hasHistory = totalUses > 0;

  const sortedTools = useMemo(() => {
    return [...ALL_TOOLS].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  }, [counts]);

  const usedTools = sortedTools.filter((t) => (counts[t.id] ?? 0) > 0);
  const unusedTools = sortedTools.filter((t) => (counts[t.id] ?? 0) === 0);
  const topToolId = usedTools[0]?.id ?? null;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative hero-glow dot-grid overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-10 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            No login. No ads. Instant results.
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-3 leading-[1.08]">
            Free Tools That Just{" "}
            <span className="gradient-text">Work.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed mb-5">
            12 powerful utilities that run entirely in your browser.
            Upload, process, download — done in seconds.
          </p>

          {totalUses > 0 && (
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 border border-border px-3 py-1.5 rounded-full">
              <Activity className="w-3.5 h-3.5 text-primary" />
              You've used these tools{" "}
              <span className="font-bold text-foreground">{totalUses}</span>{" "}
              time{totalUses !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* ── Tool Grid ── */}
        {hasHistory ? (
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Your Favourites
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {usedTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    count={counts[tool.id] ?? 0}
                    isFavourite={tool.id === topToolId}
                  />
                ))}
              </div>
            </div>

            {unusedTools.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 inline-block" />
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Not Tried Yet
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unusedTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} count={0} isFavourite={false} />
                  ))}
                  {unusedTools.length % 3 === 2 && (
                    <div className="hidden lg:flex flex-col gap-4 p-6 rounded-2xl border border-dashed border-border items-center justify-center text-center">
                      <p className="text-sm text-muted-foreground/50">More tools coming soon</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} count={0} isFavourite={false} />
            ))}
            <div className="hidden lg:flex flex-col gap-4 p-6 rounded-2xl border border-dashed border-border items-center justify-center text-center">
              <p className="text-sm text-muted-foreground/50">More tools coming soon</p>
            </div>
          </div>
        )}

        {/* ── Why ToolsHub? Comparison ── */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Trophy className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Why ToolsHub beats the rest
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-48">Feature</th>
                  <th className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      <Zap className="w-3 h-3" /> ToolsHub
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">iLoveIMG</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Smallpdf</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Convertio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {[
                  { label: "No server upload", us: true, a: false, b: false, c: false },
                  { label: "No file size limit", us: true, a: false, b: false, c: false },
                  { label: "No ads", us: true, a: false, b: false, c: false },
                  { label: "No signup required", us: true, a: true, b: false, c: false },
                  { label: "Instant in-browser processing", us: true, a: false, b: false, c: false },
                  { label: "Works offline", us: true, a: false, b: false, c: false },
                  { label: "100% free forever", us: true, a: false, b: false, c: false },
                ].map(({ label, us, a, b, c }) => (
                  <tr key={label} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{label}</td>
                    {[us, a, b, c].map((val, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {val
                          ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/15"><Check className="w-3.5 h-3.5 text-green-500" /></span>
                          : <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10"><X className="w-3.5 h-3.5 text-red-400" /></span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Feature Strip ── */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center py-5 px-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors duration-200"
            >
              <div className="p-2.5 rounded-xl bg-primary/10 mb-3">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
