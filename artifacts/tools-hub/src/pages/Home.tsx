import React, { useState, useEffect, useMemo, memo } from "react";
import { Link } from "wouter";
import {
  Image, FileText, QrCode, AlignLeft, MessageCircle,
  ArrowRight, Activity, Star, ArrowLeftRight, Maximize2,
  ShieldCheck, Zap, Globe, Smartphone, Crop, Key, Palette, Ruler,
  Check, X, Trophy, PenLine, Highlighter, ScanText, Layers, Wrench, FileUser,
} from "lucide-react";

import { useSEO } from "@/hooks/useSEO";
import { getAllToolCounts } from "@/hooks/useToolCounter";

type Category = "all" | "favourites" | "image" | "pdf" | "generator" | "utility";

const ALL_TOOLS = [
  {
    href: "/image-compressor",
    id: "image-compressor",
    icon: Image,
    title: "Image Compressor",
    description: "Compress JPG, PNG, and WebP images instantly in your browser. Reduce file size while keeping quality.",
    badge: "Browser-only",
    category: "image" as Category,
    gradient: "from-blue-500/15 to-cyan-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30",
    accentColor: "group-hover:text-blue-500",
    borderGradient: "from-blue-500 to-cyan-400",
  },
  {
    href: "/image-converter",
    id: "image-converter",
    icon: ArrowLeftRight,
    title: "Image Converter",
    description: "Convert JPG, PNG, and WebP formats in bulk. Change format and quality, download all as ZIP.",
    badge: "Batch",
    category: "image" as Category,
    gradient: "from-pink-500/15 to-rose-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30",
    accentColor: "group-hover:text-pink-500",
    borderGradient: "from-pink-500 to-rose-400",
  },
  {
    href: "/image-resizer",
    id: "image-resizer",
    icon: Maximize2,
    title: "Image Resizer",
    description: "Resize images to any dimension — HD, Full HD, Instagram, custom. Batch resize with aspect ratio lock.",
    badge: "Presets",
    category: "image" as Category,
    gradient: "from-cyan-500/15 to-teal-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/30",
    accentColor: "group-hover:text-cyan-500",
    borderGradient: "from-cyan-500 to-teal-400",
  },
  {
    href: "/image-cropper",
    id: "image-cropper",
    icon: Crop,
    title: "Image Cropper",
    description: "Drag to crop any area. Free crop, 1:1, 4:3, 16:9 and more. Download the exact region you need.",
    badge: "Drag & crop",
    category: "image" as Category,
    gradient: "from-sky-500/15 to-indigo-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/30",
    accentColor: "group-hover:text-sky-500",
    borderGradient: "from-sky-500 to-indigo-400",
  },
  {
    href: "/color-palette",
    id: "color-palette",
    icon: Palette,
    title: "Color Palette Extractor",
    description: "Upload any image and extract its dominant colors as hex codes. Copy instantly. Perfect for designers.",
    badge: "For designers",
    category: "image" as Category,
    gradient: "from-fuchsia-500/15 to-pink-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/30",
    accentColor: "group-hover:text-fuchsia-500",
    borderGradient: "from-fuchsia-500 to-pink-400",
  },
  {
    href: "/heic-converter",
    id: "heic-converter",
    icon: Smartphone,
    title: "HEIC to JPG",
    description: "Convert iPhone HEIC photos to JPG instantly. Batch convert, download as ZIP. Works 100% in your browser.",
    badge: "iPhone photos",
    category: "image" as Category,
    gradient: "from-orange-500/15 to-amber-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30",
    accentColor: "group-hover:text-orange-500",
    borderGradient: "from-orange-500 to-amber-400",
  },
  {
    href: "/pdf-converter",
    id: "pdf-converter",
    icon: FileText,
    title: "PDF Tools",
    description: "13 PDF tools — compress, merge, split, protect, watermark, organize pages and more. No upload.",
    badge: "13 tools",
    category: "pdf" as Category,
    gradient: "from-red-500/15 to-rose-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30",
    accentColor: "group-hover:text-red-500",
    borderGradient: "from-red-500 to-rose-400",
  },
  {
    href: "/e-signature",
    id: "e-signature",
    icon: PenLine,
    title: "E-Signature",
    description: "Draw or type your signature and embed it into any PDF page. Free, private, no upload required.",
    badge: "Free & Private",
    category: "pdf" as Category,
    gradient: "from-indigo-500/15 to-blue-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/30",
    accentColor: "group-hover:text-indigo-500",
    borderGradient: "from-indigo-500 to-blue-400",
  },
  {
    href: "/pdf-annotator",
    id: "pdf-annotator",
    icon: Highlighter,
    title: "PDF Annotator",
    description: "Highlight text, draw, add arrows and sticky notes on PDF pages. Download annotated PDF instantly.",
    badge: "Highlight & Draw",
    category: "pdf" as Category,
    gradient: "from-yellow-500/15 to-amber-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-yellow-500 to-amber-500 shadow-lg shadow-yellow-500/30",
    accentColor: "group-hover:text-yellow-500",
    borderGradient: "from-yellow-400 to-amber-500",
  },
  {
    href: "/ocr-tool",
    id: "ocr-tool",
    icon: ScanText,
    title: "OCR Text Extractor",
    description: "Extract text from scanned images, photos, and documents. Supports English, Hindi, and 6 more languages.",
    badge: "8 languages",
    category: "pdf" as Category,
    gradient: "from-teal-500/15 to-cyan-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30",
    accentColor: "group-hover:text-teal-500",
    borderGradient: "from-teal-500 to-cyan-400",
  },
  {
    href: "/password-generator",
    id: "password-generator",
    icon: Key,
    title: "Password Generator",
    description: "Generate strong, random passwords. Choose length, symbols, numbers. Cryptographically secure — nothing leaves your browser.",
    badge: "Secure",
    category: "generator" as Category,
    gradient: "from-emerald-500/15 to-green-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30",
    accentColor: "group-hover:text-emerald-500",
    borderGradient: "from-emerald-500 to-green-400",
  },
  {
    href: "/qr-generator",
    id: "qr-generator",
    icon: QrCode,
    title: "QR Code Generator",
    description: "Generate a QR code for any URL or text instantly. Download as PNG in seconds.",
    badge: "Instant",
    category: "generator" as Category,
    gradient: "from-teal-500/15 to-emerald-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/30",
    accentColor: "group-hover:text-teal-500",
    borderGradient: "from-teal-500 to-emerald-400",
  },
  {
    href: "/whatsapp-link",
    id: "whatsapp-link",
    icon: MessageCircle,
    title: "WhatsApp Link",
    description: "Create a direct WhatsApp chat link with a pre-filled message. Also generates a scannable QR code.",
    badge: "With QR",
    category: "generator" as Category,
    gradient: "from-green-500/15 to-lime-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-green-500 to-lime-600 shadow-lg shadow-green-500/30",
    accentColor: "group-hover:text-green-500",
    borderGradient: "from-green-500 to-lime-400",
  },
  {
    href: "/unit-converter",
    id: "unit-converter",
    icon: Ruler,
    title: "Unit Converter",
    description: "Convert length, weight, temperature, volume, area, and speed. Instant results with a full reference table.",
    badge: "6 categories",
    category: "utility" as Category,
    gradient: "from-violet-500/15 to-indigo-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30",
    accentColor: "group-hover:text-violet-500",
    borderGradient: "from-violet-500 to-indigo-400",
  },
  {
    href: "/text-cleaner",
    id: "text-cleaner",
    icon: AlignLeft,
    title: "Text Cleaner",
    description: "Remove extra spaces, normalize line breaks, change case, and strip emojis from messy text.",
    badge: "Live preview",
    category: "utility" as Category,
    gradient: "from-orange-500/15 to-yellow-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30",
    accentColor: "group-hover:text-orange-500",
    borderGradient: "from-yellow-400 to-orange-500",
  },
  {
    href: "/resume-builder",
    id: "resume-builder",
    icon: FileUser,
    title: "Resume Builder",
    description: "Create a professional resume with free templates. Fill in your details, preview live, and download as PDF.",
    badge: "8 templates",
    category: "utility" as Category,
    gradient: "from-blue-500/15 to-indigo-500/5",
    iconColor: "text-white",
    iconBg: "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30",
    accentColor: "group-hover:text-blue-600",
    borderGradient: "from-blue-500 to-indigo-400",
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
  isStarred,
  onToggleStar,
}: {
  tool: (typeof ALL_TOOLS)[number];
  count: number;
  isFavourite: boolean;
  isStarred: boolean;
  onToggleStar: (id: string) => void;
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
        <span className="absolute top-3 left-3 text-primary opacity-30 group-hover:opacity-70 transition-opacity z-10">
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

      <div className="relative flex items-center justify-between mt-auto z-10">
        <div className="flex items-center gap-1 text-xs font-semibold text-primary">
          Open tool
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1.5" />
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleStar(tool.id); }}
          className={`p-1.5 rounded-full transition-all duration-200 ${
            isStarred
              ? "text-yellow-500 bg-yellow-500/10"
              : "text-muted-foreground/40 hover:text-yellow-400 hover:bg-yellow-500/10"
          }`}
          aria-label={isStarred ? "Remove from favourites" : "Add to favourites"}
        >
          <Star className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`} />
        </button>
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
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [starredIds, setStarredIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("toolhub_favourites");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("toolhub_favourites", JSON.stringify([...next]));
      return next;
    });
  };

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

  const filteredTools = useMemo(() => {
    if (activeCategory === "all") return sortedTools;
    if (activeCategory === "favourites") return sortedTools.filter((t) => starredIds.has(t.id));
    return sortedTools.filter((t) => t.category === activeCategory);
  }, [activeCategory, sortedTools, starredIds]);

  const CATEGORY_TABS: { id: Category; label: string; icon: React.ElementType }[] = [
    { id: "all", label: "All", icon: Layers },
    { id: "favourites", label: "Favourites", icon: Star },
    { id: "image", label: "Image Tools", icon: Image },
    { id: "pdf", label: "PDF Tools", icon: FileText },
    { id: "generator", label: "Generator Tools", icon: QrCode },
    { id: "utility", label: "Utility Tools", icon: Wrench },
  ];

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

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {[
              { icon: ShieldCheck, label: "Browser-based" },
              { icon: Zap,         label: "Instant" },
              { icon: Globe,       label: "No Uploads" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 bg-primary/12 text-primary dark:bg-white/10 dark:text-white border border-primary/30 dark:border-white/20 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </span>
            ))}
          </div>

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
        {/* ── Category Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-6 mt-2">
          {CATEGORY_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/60 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tool Grid ── */}
        {activeCategory === "favourites" && starredIds.size === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Star className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">No favourites yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Kisi bhi tool ke card mein ⭐ dabao</p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">No tools in this category</p>
          </div>
        ) : activeCategory === "all" && hasHistory ? (
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Your Most Used
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {usedTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    count={counts[tool.id] ?? 0}
                    isFavourite={tool.id === topToolId}
                    isStarred={starredIds.has(tool.id)}
                    onToggleStar={toggleStar}
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
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      count={0}
                      isFavourite={false}
                      isStarred={starredIds.has(tool.id)}
                      onToggleStar={toggleStar}
                    />
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
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                count={counts[tool.id] ?? 0}
                isFavourite={tool.id === topToolId}
                isStarred={starredIds.has(tool.id)}
                onToggleStar={toggleStar}
              />
            ))}
            {filteredTools.length % 3 === 2 && (
              <div className="hidden lg:flex flex-col gap-4 p-6 rounded-2xl border border-dashed border-border items-center justify-center text-center">
                <p className="text-sm text-muted-foreground/50">More tools coming soon</p>
              </div>
            )}
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
