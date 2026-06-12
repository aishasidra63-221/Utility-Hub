import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
  Image, FileText, QrCode, AlignLeft, MessageCircle,
  ArrowRight, Activity, Star, ArrowLeftRight, Maximize2,
  ShieldCheck, Zap, Globe, Smartphone,
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
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
    accentColor: "group-hover:text-blue-500",
  },
  {
    href: "/image-converter",
    id: "image-converter",
    icon: ArrowLeftRight,
    title: "Image Converter",
    description: "Convert JPG, PNG, and WebP formats in bulk. Change format and quality, download all as ZIP.",
    badge: "Batch",
    gradient: "from-pink-500/20 to-rose-500/10",
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10 dark:bg-pink-500/15",
    accentColor: "group-hover:text-pink-500",
  },
  {
    href: "/image-resizer",
    id: "image-resizer",
    icon: Maximize2,
    title: "Image Resizer",
    description: "Resize images to any dimension — HD, Full HD, Instagram, custom. Batch resize with aspect ratio lock.",
    badge: "Presets",
    gradient: "from-cyan-500/20 to-teal-500/10",
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10 dark:bg-cyan-500/15",
    accentColor: "group-hover:text-cyan-500",
  },
  {
    href: "/pdf-converter",
    id: "pdf-converter",
    icon: FileText,
    title: "PDF Converter",
    description: "Convert PDF pages to images, or stitch multiple images into a single PDF. No upload to any server.",
    badge: "Two-way",
    gradient: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10 dark:bg-violet-500/15",
    accentColor: "group-hover:text-violet-500",
  },
  {
    href: "/qr-generator",
    id: "qr-generator",
    icon: QrCode,
    title: "QR Code Generator",
    description: "Generate a QR code for any URL or text instantly. Download as PNG in seconds.",
    badge: "Instant",
    gradient: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    accentColor: "group-hover:text-emerald-500",
  },
  {
    href: "/text-cleaner",
    id: "text-cleaner",
    icon: AlignLeft,
    title: "Text Cleaner",
    description: "Remove extra spaces, normalize line breaks, change case, and strip emojis from messy text.",
    badge: "Live preview",
    gradient: "from-orange-500/20 to-amber-500/10",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/15",
    accentColor: "group-hover:text-orange-500",
  },
  {
    href: "/whatsapp-link",
    id: "whatsapp-link",
    icon: MessageCircle,
    title: "WhatsApp Link",
    description: "Create a direct WhatsApp chat link with a pre-filled message. Also generates a scannable QR code.",
    badge: "With QR",
    gradient: "from-green-500/20 to-lime-500/10",
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10 dark:bg-green-500/15",
    accentColor: "group-hover:text-green-500",
  },
];

const FEATURES = [
  { icon: ShieldCheck, label: "100% Private", sub: "Nothing leaves your browser" },
  { icon: Zap,         label: "Instant Results", sub: "No waiting, no queues" },
  { icon: Globe,       label: "Free Forever", sub: "No paywalls, no signup" },
  { icon: Smartphone,  label: "Works Everywhere", sub: "Desktop & mobile" },
];

function ToolCard({
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
}

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
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-20 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            No login. No ads. Instant results.
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-5 leading-[1.08]">
            Free Tools That Just{" "}
            <span className="gradient-text">Work.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed mb-8">
            Seven powerful utilities that run entirely in your browser.
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

        {/* ── Feature Strip ── */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
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
