import { useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Shield, Lock, Eye, Server, Cpu, Wifi, CheckCircle2,
  ArrowRight, AlertTriangle, Zap, Globe,
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

const trustBadges = [
  { icon: <Server className="w-5 h-5" />,  title: "Zero Server Uploads",   desc: "Your files are never sent to any server. Processing happens entirely on your own device.", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: <Eye className="w-5 h-5" />,     title: "No Data Collection",    desc: "We don't track what files you process, what images you compress, or what text you type.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: <Lock className="w-5 h-5" />,    title: "No Account Required",   desc: "There's no login, no sign-up, no email. Nothing is tied to your identity.", color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: <Wifi className="w-5 h-5" />,    title: "Works Offline",         desc: "Once the tool loads, you can disconnect from the internet and it will still work.", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: <Cpu className="w-5 h-5" />,     title: "Your CPU Does the Work", desc: "Heavy tasks like AI background removal and image processing run directly on your own hardware — not ours.", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: <Globe className="w-5 h-5" />,   title: "Open Standards",        desc: "Built entirely on open web standards. No proprietary software, no black boxes, no hidden dependencies.", color: "text-primary", bg: "bg-primary/10" },
];

const notCollected = [
  "Your images or documents",
  "Your passwords or QR codes",
  "Your IP address or location",
  "Your browser history or cookies",
  "Any analytics about which tools you use",
  "Your device name or hardware info",
];

const howItWorks = [
  {
    step: "01",
    title: "You upload a file",
    desc: "The file is read by your browser using the File API — it stays in your device's memory. Nothing is transmitted.",
  },
  {
    step: "02",
    title: "Your browser processes it",
    desc: "Your browser's built-in processing engine handles everything at near-native speed — the same technology powering modern games and apps on the web.",
  },
  {
    step: "03",
    title: "You download the result",
    desc: "The output is generated locally and downloaded directly to your device. The file is cleared from memory when you close the tab.",
  },
];

export default function Security() {
  useSEO({
    title: "Security & Privacy — ToolsHub",
    description:
      "Learn how ToolsHub keeps your data 100% private. No server uploads, no data collection, everything runs in your browser.",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* ── Hero ── */}
      <RevealSection delay={0}>
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 mb-6 mx-auto">
            <Shield className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
            Your privacy is <span className="text-emerald-500">guaranteed</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ToolsHub was built with a simple rule: <strong className="text-foreground">your files never leave your device.</strong>{" "}
            Not because we try hard to be private — but because our architecture makes it technically impossible to see your data.
          </p>
        </div>
      </RevealSection>

      {/* ── Big claim ── */}
      <RevealSection delay={80}>
        <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-6 mb-14 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-foreground mb-1">We literally cannot see your files</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ToolsHub has no backend that receives images or documents. Our server only serves the website's
              HTML, CSS, and JavaScript files — the same way any website serves a webpage. Once those load in
              your browser, all processing runs locally. We have no endpoint that accepts file uploads.
            </p>
          </div>
        </div>
      </RevealSection>

      {/* ── How it works ── */}
      <RevealSection delay={120}>
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6">How it actually works</h2>
          <div className="space-y-4">
            {howItWorks.map((item, i) => (
              <RevealSection key={item.step} delay={160 + i * 80}>
                <div className="flex items-start gap-5 bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-extrabold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground mb-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── Trust badges ── */}
      <RevealSection delay={150}>
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-foreground mb-6">Security guarantees</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trustBadges.map((badge, i) => (
              <RevealSection key={badge.title} delay={200 + i * 50}>
                <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow h-full">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${badge.bg}`}>
                    <span className={badge.color}>{badge.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm mb-1">{badge.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── What we don't collect ── */}
      <RevealSection delay={200}>
        <div className="bg-card border border-border rounded-2xl p-8 mb-14">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground">What we don't collect</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            We genuinely collect nothing that identifies you or your content. Here's the full list:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {notCollected.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── Performance bonus ── */}
      <RevealSection delay={250}>
        <div className="bg-gradient-to-br from-primary/5 via-primary/8 to-transparent border border-primary/20 rounded-2xl p-8 mb-14 flex items-start gap-5">
          <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Privacy = Speed</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Processing files locally on your device is actually <em>faster</em> than sending them to a
              server and waiting for a response. No network latency, no queue, no throttling.
              Your files are processed at the full speed of your own hardware.
            </p>
          </div>
        </div>
      </RevealSection>

      {/* ── CTA ── */}
      <RevealSection delay={280}>
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto">
            Ready to try it? Pick any tool and see for yourself — open your browser's network tab and watch: no file upload request will ever appear.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Shield className="w-4 h-4" />
            Try a tool securely
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </RevealSection>
    </div>
  );
}
