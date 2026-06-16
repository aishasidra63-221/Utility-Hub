import { useEffect } from "react";
import { Link } from "wouter";
import {
  CheckCircle2, HelpCircle, Zap, Shield, Users,
  GitCompare, Chrome, ArrowRight, Info,
} from "lucide-react";
import type { ToolData } from "@/lib/toolsData";

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

interface Props { tool: ToolData }

export function ToolAEOSection({ tool }: Props) {
  useEffect(() => {
    const origin = window.location.origin;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    };
    injectSchema("schema-faq-tool", faqSchema);

    const webAppSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.title,
      url: `${origin}${tool.href}`,
      description: tool.tagline,
      applicationCategory: "UtilityApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: tool.features.join(", "),
    };
    injectSchema("schema-webapp-tool", webAppSchema);

    return () => {
      removeSchema("schema-faq-tool");
      removeSchema("schema-webapp-tool");
    };
  }, [tool]);

  return (
    <div className="border-t border-border bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">

        {/* ── AEO Quick Answers ── */}
        <section aria-label="Tool overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">What is {tool.title}?</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.whatIsIt}</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">How does it work?</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.howItWorks}</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Is it free?</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.isFree}</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Is it private?</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tool.isPrivate}</p>
            </div>
          </div>
        </section>

        {/* ── GEO: Use Cases ── */}
        <section aria-label="Use cases">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Who uses {tool.title}?</h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tool.useCases.map((uc, i) => (
              <li key={i} className="flex items-start gap-3 p-3.5 bg-card border border-border rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{uc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── GEO: Why Browser-Based ── */}
        <section
          aria-label="Why browser-based"
          className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Chrome className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Why browser-based processing is better</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">{tool.whyBrowserBased}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Shield, title: "100% Private", desc: "Files stay on your device. Never uploaded to any server." },
              { icon: Zap,    title: "Instant Results", desc: "No network round-trip. Processing starts immediately." },
              { icon: CheckCircle2, title: "Works Offline", desc: "Once the page loads, no internet needed for processing." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-background/60 rounded-xl p-3.5">
                <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── GEO: Alternatives Comparison ── */}
        {tool.alternatives.length > 0 && (
          <section aria-label="Comparison with alternatives">
            <div className="flex items-center gap-2 mb-5">
              <GitCompare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">ToolsHub vs Alternatives</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-5 font-semibold text-foreground">Tool</th>
                    <th className="text-left py-3 px-5 font-semibold text-green-600">Privacy</th>
                    <th className="text-left py-3 px-5 font-semibold text-muted-foreground">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 bg-primary/5">
                    <td className="py-3 px-5 font-semibold text-primary">ToolsHub ✓</td>
                    <td className="py-3 px-5 text-green-600 font-medium text-xs">100% browser — no upload</td>
                    <td className="py-3 px-5 text-muted-foreground text-xs">Free forever</td>
                  </tr>
                  {tool.alternatives.map((name, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-5 font-medium text-foreground">{name}</td>
                      <td className="py-3 px-5 text-muted-foreground text-xs">Server-side (uploads required)</td>
                      <td className="py-3 px-5 text-muted-foreground text-xs">Free tier with limits</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {tool.faq.length > 0 && (
          <section aria-label="Frequently asked questions">
            <div className="flex items-center gap-2 mb-5">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {tool.faq.map((item, i) => (
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

        {/* ── Privacy Trust Block ── */}
        <section aria-label="Privacy and trust" className="flex flex-col sm:flex-row gap-4">
          {[
            { icon: Shield,       color: "text-blue-500",  title: "No Upload — Ever",      desc: "Your files are processed locally. They never touch a server." },
            { icon: CheckCircle2, color: "text-green-500", title: "No Signup Required",    desc: "No account, no email. Open the tool and start working." },
            { icon: Zap,          color: "text-yellow-500",title: "Always Free",           desc: "No hidden fees, no premium tier for basic features." },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex-1 flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
              <Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </section>

        <p className="text-xs text-muted-foreground text-center">
          Learn more about how we protect your privacy on our{" "}
          <Link href="/security" className="text-primary hover:underline">Security page</Link>.
        </p>
      </div>
    </div>
  );
}
