import { useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Heart, Zap, Shield, Globe, Users, Lightbulb,
  ArrowRight, Star, Code2, Layers,
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

const stats = [
  { value: "26+",   label: "Free Tools",        icon: <Layers className="w-5 h-5" /> },
  { value: "100%",  label: "Browser-based",     icon: <Code2 className="w-5 h-5" /> },
  { value: "0",     label: "Server Uploads",    icon: <Shield className="w-5 h-5" /> },
  { value: "∞",     label: "Uses, Forever Free", icon: <Star className="w-5 h-5" /> },
];

const values = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy by Design",
    desc: "Every tool we build starts with the same constraint: your data never leaves your device. This isn't a feature — it's a founding principle.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Speed Without Compromise",
    desc: "Running locally means blazing-fast results. No waiting for server responses, no file queues, no upload speed limits.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Genuinely Free",
    desc: "No freemium tricks. No credits that expire. No features locked behind a subscription. Every tool, fully free, always.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Built for Everyone",
    desc: "Whether you're a student compressing a photo or a professional signing a PDF — ToolsHub works for anyone, anywhere.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Open Web Standards",
    desc: "We use only open, standardised web technology: WebAssembly, Canvas API, Web Workers. No proprietary black boxes.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community Driven",
    desc: "Our roadmap is shaped by real user requests. If a tool doesn't exist, tell us — we'll build it.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const techStack = [
  { label: "React 19",          desc: "UI framework" },
  { label: "WebAssembly",       desc: "Heavy processing" },
  { label: "ONNX Runtime",      desc: "AI models in-browser" },
  { label: "Tesseract.js",      desc: "OCR engine" },
  { label: "PDF-Lib",           desc: "PDF manipulation" },
  { label: "Hugging Face",      desc: "Open AI models" },
];

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ToolsHub",
  url: "https://toolshub.app",
  logo: "https://toolshub.app/favicon.svg",
  description: "Free browser-based utility tools — image processing, PDF manipulation, generators and more. No login, no ads, no server uploads.",
  sameAs: [],
  foundingDate: "2025",
  knowsAbout: [
    "Image compression", "PDF tools", "Browser-based processing",
    "WebAssembly", "Privacy-first software", "Online utilities",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "All tools are free to use with no limits.",
  },
};

export default function AboutUs() {
  useSEO({
    title: "About ToolsHub — Free Browser-Based Tools for Everyone",
    description:
      "Learn about the ToolsHub mission: 26+ free, private, browser-based utilities with no login, no ads, and no server uploads.",
    schemas: [ORG_SCHEMA],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* ── Hero ── */}
      <RevealSection delay={0}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Heart className="w-3.5 h-3.5" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
            Tools that <span className="text-primary">just work</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ToolsHub started with a frustration: why do so many online tools require
            sign-ups, charge for basic features, or upload your private files to unknown servers?
            We decided to build something better.
          </p>
        </div>
      </RevealSection>

      {/* ── Stats ── */}
      <RevealSection delay={80}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow"
            >
              <span className="text-primary">{s.icon}</span>
              <p className="text-3xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ── Mission ── */}
      <RevealSection delay={100}>
        <div className="bg-gradient-to-br from-primary/5 via-primary/8 to-transparent border border-primary/20 rounded-2xl p-8 mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed text-sm mb-4">
            We believe powerful software tools shouldn't be gated behind accounts, subscriptions, or privacy
            compromises. The modern browser is an incredibly capable platform — it can compress images, remove
            backgrounds with AI, generate PDFs, run OCR, and much more, entirely on your device.
          </p>
          <p className="text-muted-foreground leading-relaxed text-sm">
            ToolsHub exists to unlock that potential for everyone. We build tools that are fast, private, and
            genuinely free — not just during a trial period, but forever. No strings attached.
          </p>
        </div>
      </RevealSection>

      {/* ── Values ── */}
      <RevealSection delay={120}>
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6">What we stand for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <RevealSection key={v.title} delay={160 + i * 60}>
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow h-full">
                  <div className={`inline-flex p-2.5 rounded-xl ${v.bg} mb-4`}>
                    <span className={v.color}>{v.icon}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── How we're built ── */}
      <RevealSection delay={200}>
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-2">Built on open technology</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Everything ToolsHub does is powered by open, auditable web standards. No proprietary cloud APIs,
            no hidden dependencies.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {techStack.map((t) => (
              <div
                key={t.label}
                className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-0.5 hover:border-primary/30 transition-colors"
              >
                <p className="text-sm font-bold text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── Team ── */}
      <RevealSection delay={220}>
        <div className="bg-card border border-border rounded-2xl p-8 mb-14 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 mx-auto">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3">A small team with big ambitions</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            ToolsHub is built by a small, passionate team of developers who care deeply about privacy,
            performance, and great user experience. We're not backed by venture capital or ad revenue —
            just a genuine desire to make the web more useful for everyone.
          </p>
        </div>
      </RevealSection>

      {/* ── CTA ── */}
      <RevealSection delay={250}>
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Enough reading — go build something. Every tool is free, private, and ready to use right now.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Zap className="w-4 h-4" />
              Start using ToolsHub
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/security"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-accent transition-colors"
            >
              <Shield className="w-4 h-4" />
              Read about security
            </Link>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
