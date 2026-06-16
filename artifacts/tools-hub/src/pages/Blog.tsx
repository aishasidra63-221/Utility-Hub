import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { BLOG_POSTS } from "@/lib/blogData";
import { Clock, ArrowRight } from "lucide-react";

type FilterCat = "all" | "image" | "pdf" | "generator" | "utility";

const CATEGORY_LABELS: Record<FilterCat, string> = {
  all:       "All Posts",
  image:     "Image Tools",
  pdf:       "PDF Tools",
  generator: "Generator Tools",
  utility:   "Utility Tools",
};

const CATEGORY_COLORS: Record<string, string> = {
  image:     "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  pdf:       "bg-red-500/15 text-red-600 dark:text-red-400",
  generator: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  utility:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

function BlogHeroSvg({ category, className = "w-full h-full" }: { category: string; className?: string }) {
  if (category === "image") {
    return (
      <svg viewBox="0 0 240 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="240" height="160" rx="12" fill="url(#img-bg)" />
        <defs>
          <linearGradient id="img-bg" x1="0" y1="0" x2="240" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" stopOpacity=".18" />
            <stop offset="1" stopColor="#06b6d4" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <rect x="30" y="30" width="180" height="100" rx="10" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
        <ellipse cx="120" cy="68" rx="22" ry="22" fill="#7dd3fc" />
        <ellipse cx="120" cy="68" rx="12" ry="12" fill="#0ea5e9" />
        <path d="M30 110 Q70 80 110 95 Q150 110 210 75 L210 130 Q150 140 70 125 Z" fill="#bae6fd" opacity=".7" />
        <circle cx="165" cy="50" r="8" fill="#fde68a" />
      </svg>
    );
  }
  if (category === "pdf") {
    return (
      <svg viewBox="0 0 240 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="240" height="160" rx="12" fill="url(#pdf-bg)" />
        <defs>
          <linearGradient id="pdf-bg" x1="0" y1="0" x2="240" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ef4444" stopOpacity=".15" />
            <stop offset="1" stopColor="#f97316" stopOpacity=".10" />
          </linearGradient>
        </defs>
        <rect x="65" y="20" width="110" height="130" rx="8" fill="white" stroke="#fca5a5" strokeWidth="1.5" />
        <path d="M65 48 L175 48" stroke="#fca5a5" strokeWidth="1" />
        <rect x="80" y="60" width="80" height="6" rx="3" fill="#fca5a5" />
        <rect x="80" y="74" width="60" height="6" rx="3" fill="#fca5a5" opacity=".6" />
        <rect x="80" y="88" width="70" height="6" rx="3" fill="#fca5a5" opacity=".6" />
        <rect x="80" y="102" width="50" height="6" rx="3" fill="#fca5a5" opacity=".4" />
        <path d="M65 28 L85 20 L85 28 Z" fill="#fca5a5" />
        <rect x="100" y="120" width="40" height="18" rx="9" fill="#ef4444" />
        <rect x="110" y="126" width="20" height="6" rx="3" fill="white" opacity=".9" />
      </svg>
    );
  }
  if (category === "generator") {
    return (
      <svg viewBox="0 0 240 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="240" height="160" rx="12" fill="url(#gen-bg)" />
        <defs>
          <linearGradient id="gen-bg" x1="0" y1="0" x2="240" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" stopOpacity=".15" />
            <stop offset="1" stopColor="#06b6d4" stopOpacity=".10" />
          </linearGradient>
        </defs>
        <circle cx="120" cy="80" r="40" fill="#ede9fe" stroke="#a78bfa" strokeWidth="1.5" />
        <path d="M120 50 L126 68 L146 68 L131 79 L137 97 L120 86 L103 97 L109 79 L94 68 L114 68 Z" fill="#8b5cf6" opacity=".8" />
        <circle cx="60" cy="40" r="8" fill="#c4b5fd" opacity=".6" />
        <circle cx="180" cy="35" r="6" fill="#a78bfa" opacity=".5" />
        <circle cx="185" cy="120" r="10" fill="#c4b5fd" opacity=".4" />
        <circle cx="45" cy="115" r="6" fill="#a78bfa" opacity=".4" />
        <path d="M55 45 L62 38" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M175 40 L178 32" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="240" height="160" rx="12" fill="url(#util-bg)" />
      <defs>
        <linearGradient id="util-bg" x1="0" y1="0" x2="240" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" stopOpacity=".15" />
          <stop offset="1" stopColor="#10b981" stopOpacity=".10" />
        </linearGradient>
      </defs>
      <rect x="40" y="30" width="70" height="45" rx="6" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" />
      <rect x="50" y="42" width="50" height="6" rx="3" fill="#f59e0b" opacity=".7" />
      <rect x="50" y="54" width="35" height="6" rx="3" fill="#f59e0b" opacity=".4" />
      <rect x="130" y="30" width="70" height="45" rx="6" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="1.5" />
      <rect x="140" y="42" width="50" height="6" rx="3" fill="#10b981" opacity=".7" />
      <rect x="140" y="54" width="35" height="6" rx="3" fill="#10b981" opacity=".4" />
      <rect x="40" y="90" width="70" height="45" rx="6" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1.5" />
      <rect x="50" y="102" width="50" height="6" rx="3" fill="#6366f1" opacity=".7" />
      <rect x="50" y="114" width="35" height="6" rx="3" fill="#6366f1" opacity=".4" />
      <rect x="130" y="90" width="70" height="45" rx="6" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="1.5" />
      <rect x="140" y="102" width="50" height="6" rx="3" fill="#ec4899" opacity=".7" />
      <rect x="140" y="114" width="35" height="6" rx="3" fill="#ec4899" opacity=".4" />
    </svg>
  );
}

export default function Blog() {
  const [filter, setFilter] = useState<FilterCat>("all");

  useSEO({
    title: "Blog — Free Tool Guides & Tips | ToolsHub",
    description: "In-depth guides for every ToolsHub tool — image compression, PDF editing, OCR, password generators, and more. Learn how to use free browser-based tools effectively.",
    canonical: "https://toolshub.app/blog",
    keywords: "tool guides, image compression tips, PDF tools, OCR guide, password generator, free online tools",
  });

  const filtered = filter === "all" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === filter);

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ToolsHub Blog",
    description: "Guides for every free browser-based tool on ToolsHub",
    numberOfItems: BLOG_POSTS.length,
    itemListElement: BLOG_POSTS.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://toolshub.app/blog/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ── Hero ── */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
          ToolsHub Blog
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          In-depth guides for every tool — how it works, step-by-step walkthroughs, comparisons to alternatives, and real-world use cases.
        </p>
        <p className="text-xs text-muted-foreground mt-2">{BLOG_POSTS.length} guides — all free, all browser-based</p>
      </div>

      {/* ── Category filter ── */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {(Object.keys(CATEGORY_LABELS) as FilterCat[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {CATEGORY_LABELS[cat]}
            <span className="ml-1.5 text-xs opacity-70">
              ({cat === "all" ? BLOG_POSTS.length : BLOG_POSTS.filter((p) => p.category === cat).length})
            </span>
          </button>
        ))}
      </div>

      {/* ── Post grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <article className="h-full flex flex-col rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden">
              {/* Thumbnail */}
              <div className="h-36 bg-muted overflow-hidden">
                <BlogHeroSvg category={post.category} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col flex-1 p-4">
                {/* Category badge */}
                <span className={`self-start text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${CATEGORY_COLORS[post.category]}`}>
                  {CATEGORY_LABELS[post.category]}
                </span>

                {/* Title */}
                <h2 className="text-sm font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{post.readMinutes} min read</span>
                  </div>
                  <span className="text-[11px] text-primary font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                    Read more <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
    </div>
  );
}
