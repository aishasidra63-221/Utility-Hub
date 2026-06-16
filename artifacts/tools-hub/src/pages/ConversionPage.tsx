import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Shield, Zap, CheckCircle2, ArrowRight, HelpCircle,
  Lock, Download, Upload, Settings2,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import type { ConversionConfig } from "@/lib/conversionData";
import { CONVERSION_BY_SLUG } from "@/lib/conversionData";

function injectSchema(id: string, data: object) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    (el as HTMLScriptElement).type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}
function removeSchema(id: string) { document.getElementById(id)?.remove(); }

const STEP_ICONS = [Upload, Settings2, Download];

export default function ConversionPage() {
  const [location] = useLocation();
  const slug = location.replace(/^\//, "");
  const config: ConversionConfig | undefined = CONVERSION_BY_SLUG.get(slug);

  useSEO({
    title: config ? config.title : "File Converter — ToolsHub",
    description: config
      ? config.metaDescription
      : "Free file format converter running entirely in your browser.",
    canonical: config
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/${slug}`
      : undefined,
    keywords: config
      ? `${config.fromFormat} to ${config.toFormat}, convert ${config.fromFormat} to ${config.toFormat}, free, online, no upload`
      : undefined,
  });

  useEffect(() => {
    if (!config) return;
    const origin = window.location.origin;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    };
    injectSchema("schema-faq-conv", faqSchema);

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to convert ${config.fromFormat} to ${config.toFormat}`,
      description: config.intro,
      url: `${origin}/${config.slug}`,
      totalTime: "PT1M",
      tool: { "@type": "HowToTool", name: "ToolsHub Image Converter" },
      step: config.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.desc,
      })),
    };
    injectSchema("schema-howto-conv", howToSchema);

    return () => {
      removeSchema("schema-faq-conv");
      removeSchema("schema-howto-conv");
    };
  }, [config]);

  if (!config) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Conversion page not found.</p>
        <Link href="/" className="text-primary hover:underline text-sm mt-4 inline-block">← Back to all tools</Link>
      </div>
    );
  }

  const isImageConv = config.category === "image";
  const fromColor = isImageConv ? "from-blue-500 to-cyan-500" : "from-red-500 to-rose-600";

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <div className={`relative bg-gradient-to-br ${config.accentColor} overflow-hidden`}>
        <div className="absolute inset-0 bg-background/85" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">

          {/* Format badges */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold text-foreground shadow-sm">
              .{config.fromFormat.toLowerCase()}
            </span>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <span className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-sm">
              .{config.toFormat.toLowerCase()}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            {config.h1}
          </h1>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {[
              { icon: Shield, text: "No upload — files stay on your device" },
              { icon: Lock, text: "No signup required" },
              { icon: Zap, text: "Instant conversion" },
              { icon: CheckCircle2, text: "100% Free" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-full">
                <Icon className="w-3.5 h-3.5 text-green-500" />
                {text}
              </span>
            ))}
          </div>

          {/* Big CTA */}
          <Link
            href={config.toolHref}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-base font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            Convert {config.fromFormat} to {config.toFormat} Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            Opens the free {config.fromFormat} to {config.toFormat} converter — runs in your browser
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">

        {/* ── Intro ── */}
        <section>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">{config.intro}</p>
        </section>

        {/* ── How to convert (Step-by-step) ── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            How to convert {config.fromFormat} to {config.toFormat} — step by step
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.steps.map((step, i) => {
              const Icon = STEP_ICONS[Math.min(i, STEP_ICONS.length - 1)];
              return (
                <div key={i} className="relative bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Repeat CTA */}
          <div className="mt-6 flex justify-center">
            <Link
              href={config.toolHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Open {config.fromFormat} to {config.toFormat} Converter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Why use ToolsHub to convert {config.fromFormat} to {config.toFormat}?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Shield,
                color: "text-blue-500",
                title: "100% Private",
                desc: `Your ${config.fromFormat} files are converted entirely in your browser using the HTML5 Canvas API. No file is ever sent to a server.`,
              },
              {
                icon: Zap,
                color: "text-yellow-500",
                title: "Instant Conversion",
                desc: "There's no upload wait time. Conversion starts immediately when you select your file and completes in seconds.",
              },
              {
                icon: CheckCircle2,
                color: "text-green-500",
                title: "Always Free",
                desc: `Convert ${config.fromFormat} to ${config.toFormat} as many times as you need. No daily limits, no watermarks, no credit card.`,
              },
              {
                icon: Download,
                color: "text-purple-500",
                title: "Batch Conversion",
                desc: `Convert multiple ${config.fromFormat} files to ${config.toFormat} at once. Download all results as a single ZIP file.`,
              },
              {
                icon: Lock,
                color: "text-rose-500",
                title: "No Signup",
                desc: "Open the tool and start converting immediately. No account, no email, no password. Your data is your own.",
              },
              {
                icon: Settings2,
                color: "text-teal-500",
                title: "Quality Control",
                desc: `Adjust output quality to balance file size and visual fidelity when converting to ${config.toFormat}.`,
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-5">
                <Icon className={`w-5 h-5 ${color} mb-3`} />
                <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Use Cases ── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            When to convert {config.fromFormat} to {config.toFormat}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.useCases.map((uc, i) => (
              <li key={i} className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{uc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Alternatives Comparison ── */}
        {config.alternatives.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ToolsHub vs other {config.fromFormat} to {config.toFormat} converters
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Most online converters upload your files to their servers. ToolsHub never does.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-5 font-semibold text-foreground">Converter</th>
                    <th className="text-left py-3 px-5 font-semibold text-green-600">Files uploaded?</th>
                    <th className="text-left py-3 px-5 font-semibold text-muted-foreground">Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 bg-primary/5">
                    <td className="py-3 px-5 font-semibold text-primary">ToolsHub ✓</td>
                    <td className="py-3 px-5">
                      <span className="text-green-600 font-medium">No — 100% browser-based</span>
                    </td>
                    <td className="py-3 px-5 text-muted-foreground text-xs">Free, unlimited, no signup</td>
                  </tr>
                  {config.alternatives.map((alt, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-5 font-medium text-foreground">{alt.name}</td>
                      <td className="py-3 px-5 text-muted-foreground text-xs">Yes — server-side</td>
                      <td className="py-3 px-5 text-muted-foreground text-xs">{alt.issue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {config.faq.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                {config.fromFormat} to {config.toFormat} — FAQ
              </h2>
            </div>
            <div className="space-y-3">
              {config.faq.map((item, i) => (
                <details
                  key={i}
                  className="group bg-card border border-border rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-medium text-sm text-foreground hover:text-primary transition-colors select-none">
                    <span>{item.q}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ── Related Conversions ── */}
        {config.relatedSlugs.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">Related conversions</h2>
            <div className="flex flex-wrap gap-3">
              {config.relatedSlugs.map((relSlug) => {
                const rel = CONVERSION_BY_SLUG.get(relSlug);
                if (!rel) return null;
                return (
                  <Link
                    key={relSlug}
                    href={`/${relSlug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:text-primary hover:border-primary/40 transition-all"
                  >
                    {rel.fromFormat} to {rel.toFormat}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Final CTA ── */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Ready to convert {config.fromFormat} to {config.toFormat}?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Free, instant, private. No upload. No signup. Just open and convert.
          </p>
          <Link
            href={config.toolHref}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-base font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            Convert {config.fromFormat} to {config.toFormat} — Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

      </div>
    </div>
  );
}
