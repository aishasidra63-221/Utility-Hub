import { Link } from "wouter";
import { ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { TOOL_BY_HREF, POPULAR_TOOL_HREFS } from "@/lib/toolsData";

function ToolMiniCard({ href, currentHref }: { href: string; currentHref?: string }) {
  const tool = TOOL_BY_HREF.get(href);
  if (!tool || href === currentHref) return null;
  return (
    <Link
      href={href}
      className="group flex-shrink-0 flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all duration-150 min-w-[176px] max-w-[220px]"
    >
      <div className={`w-8 h-8 rounded-lg ${tool.iconBg} flex-shrink-0`} />
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
  const validRelated = relatedHrefs.filter(
    (h) => h !== currentHref && TOOL_BY_HREF.has(h)
  );

  const popularHrefs = POPULAR_TOOL_HREFS.filter(
    (h) => h !== currentHref && !validRelated.includes(h)
  ).slice(0, 4);

  const hasRelated  = validRelated.length > 0;
  const hasPopular  = popularHrefs.length > 0;

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
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1" role="list">
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
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1" role="list">
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
