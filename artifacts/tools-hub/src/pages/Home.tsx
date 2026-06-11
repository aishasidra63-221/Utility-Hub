import { Link } from "wouter";
import { Image, FileText, QrCode, AlignLeft, MessageCircle, ArrowRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const tools = [
  {
    href: "/image-compressor",
    icon: Image,
    title: "Image Compressor",
    description: "Compress JPG, PNG, and WebP images instantly in your browser. Reduce file size while keeping quality.",
    badge: "Browser-only",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    href: "/pdf-converter",
    icon: FileText,
    title: "PDF Converter",
    description: "Convert PDF pages to images, or stitch multiple images into a single PDF. No upload to any server.",
    badge: "Two-way",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    href: "/qr-generator",
    icon: QrCode,
    title: "QR Code Generator",
    description: "Generate a QR code for any URL or text instantly. Download as PNG in seconds.",
    badge: "Instant",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    href: "/text-cleaner",
    icon: AlignLeft,
    title: "Text Cleaner",
    description: "Remove extra spaces, normalize line breaks, change case, and strip emojis from messy text.",
    badge: "Live preview",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    href: "/whatsapp-link",
    icon: MessageCircle,
    title: "WhatsApp Link Generator",
    description: "Create a direct WhatsApp chat link with a pre-filled message. Also generates a scannable QR code.",
    badge: "With QR",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
];

export default function Home() {
  useSEO({
    title: "Zero-Friction Tools Hub — Free Online Tools",
    description:
      "Free online tools: compress images, convert PDFs, generate QR codes, clean text, and create WhatsApp links. No signup, no ads, instant results.",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          No login. No ads. Instant results.
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          Free Online Tools
          <br />
          <span className="text-primary">Built for Speed</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Five essential utilities that run entirely in your browser.
          Upload, process, download — done.
        </p>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              data-testid={`card-tool-${tool.href.slice(1)}`}
              className="group relative flex flex-col gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${tool.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {tool.badge}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                  {tool.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-primary mt-auto">
                Open tool
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}

        {/* Spacer card (for grid symmetry on lg) */}
        <div className="hidden lg:flex flex-col gap-4 p-6 rounded-xl border border-dashed border-border items-center justify-center text-center opacity-40">
          <p className="text-sm text-muted-foreground">More tools coming soon</p>
        </div>
      </div>

      {/* Features strip */}
      <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "No upload to server", sub: "Runs in your browser" },
          { label: "No signup required", sub: "Zero friction, always" },
          { label: "Free forever", sub: "No paywalls" },
          { label: "Mobile-friendly", sub: "Works on any device" },
        ].map((f) => (
          <div key={f.label} className="text-center py-4 px-3 rounded-lg bg-muted/50">
            <p className="text-sm font-semibold text-foreground">{f.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{f.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
