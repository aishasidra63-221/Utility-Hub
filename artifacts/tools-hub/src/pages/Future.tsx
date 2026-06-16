import { useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Rocket, Sparkles, Zap, Globe, Brain, Shield, Video,
  FileText, Image, Palette, Wand2, ArrowRight, CheckCircle2,
  Star, Gift,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const upcoming = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: "AI Image Enhancer",
    desc: "Sharpen, denoise and upscale photos using on-device AI — no cloud needed.",
    status: "In development",
    color: "bg-violet-500/10 text-violet-500",
    tag: "Image Tools",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "PDF to Word / Excel",
    desc: "Convert PDFs to fully editable Word and Excel files, entirely in your browser.",
    status: "Coming soon",
    color: "bg-blue-500/10 text-blue-500",
    tag: "PDF Tools",
  },
  {
    icon: <Video className="w-5 h-5" />,
    title: "Video Compressor",
    desc: "Compress MP4 and WebM videos to a fraction of their size using WebAssembly FFmpeg.",
    status: "Planned",
    color: "bg-rose-500/10 text-rose-500",
    tag: "Video Tools",
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: "Brand Kit Generator",
    desc: "Pick colours, generate palettes, export logo variations — all in one place.",
    status: "Planned",
    color: "bg-amber-500/10 text-amber-500",
    tag: "Design Tools",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Full Multi-Language UI",
    desc: "Translate the entire app interface into Hindi, Spanish, French, Arabic and more.",
    status: "In development",
    color: "bg-emerald-500/10 text-emerald-500",
    tag: "Platform",
  },
  {
    icon: <Wand2 className="w-5 h-5" />,
    title: "AI Photo Retoucher",
    desc: "Remove blemishes, adjust skin tone and enhance portraits — runs on your device.",
    status: "Planned",
    color: "bg-pink-500/10 text-pink-500",
    tag: "Image Tools",
  },
];

const promises = [
  "Always 100% free — forever",
  "No account or login required",
  "No file uploads to any server",
  "No ads, ever",
  "Open and transparent technology",
  "Community-driven feature requests",
];

export default function Future() {
  useSEO({
    title: "Future of ToolsHub — What's Coming Next",
    description:
      "See what new browser-based tools and features are on the ToolsHub roadmap. 100% free, always.",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* ── Hero ── */}
      <RevealSection delay={0}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Rocket className="w-3.5 h-3.5" />
            Roadmap &amp; Vision
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
            The future is <span className="text-primary">browser-first</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ToolsHub is growing fast. Every new tool runs entirely in your browser —
            no cloud, no fees, no limits. Here's what we're building next.
          </p>
        </div>
      </RevealSection>

      {/* ── How it works ── */}
      <RevealSection delay={100}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            {
              icon: <Zap className="w-6 h-6 text-amber-500" />,
              title: "Instant & Fast",
              desc: "Tools run locally on your CPU/GPU — no round-trip to a server. Results in seconds.",
            },
            {
              icon: <Shield className="w-6 h-6 text-emerald-500" />,
              title: "100% Private",
              desc: "Your files never leave your device. Not even for a millisecond.",
            },
            {
              icon: <Gift className="w-6 h-6 text-primary" />,
              title: "Always Free",
              desc: "No subscriptions, no credits, no paywalls. Everything is free, always.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className="p-3 rounded-xl bg-muted">{item.icon}</div>
              <p className="font-bold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ── Upcoming tools ── */}
      <RevealSection delay={150}>
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Upcoming Tools</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcoming.map((item, i) => (
              <RevealSection key={item.title} delay={200 + i * 60}>
                <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-foreground text-sm">{item.title}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.desc}</p>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                          item.status === "In development"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : item.status === "Coming soon"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── Our promise ── */}
      <RevealSection delay={200}>
        <div className="bg-gradient-to-br from-primary/5 via-primary/8 to-transparent border border-primary/20 rounded-2xl p-8 mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Our Promise to You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {promises.map((p) => (
              <div key={p} className="flex items-center gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── Suggest a feature ── */}
      <RevealSection delay={250}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Have an idea?</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto">
            We build what our users actually need. If there's a tool you wish existed,
            let us know — many of our best tools started as user suggestions.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Image className="w-4 h-4" />
            Explore all tools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </RevealSection>
    </div>
  );
}
