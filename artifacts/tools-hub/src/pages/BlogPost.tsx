import { Link, useParams } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { BLOG_POST_MAP, BLOG_POSTS, type BlogSection } from "@/lib/blogData";
import { BLOG_COVER_IMAGES } from "@/lib/blogImages";
import { BLOG_EXTENSIONS } from "@/lib/blogExtensions";
import { Clock, Calendar, ArrowRight, ExternalLink, ChevronRight } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
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
      <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="800" height="400" fill="url(#img-hero-bg)" />
        <defs>
          <linearGradient id="img-hero-bg" x1="0" y1="0" x2="800" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dbeafe" />
            <stop offset="1" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
        <rect x="100" y="60" width="600" height="280" rx="20" fill="white" opacity=".8" stroke="#93c5fd" strokeWidth="2" />
        <ellipse cx="400" cy="190" rx="70" ry="70" fill="#bae6fd" />
        <ellipse cx="400" cy="190" rx="40" ry="40" fill="#38bdf8" />
        <path d="M100 300 Q200 240 340 265 Q480 290 700 220 L700 340 Q480 370 200 350 Z" fill="#93c5fd" opacity=".5" />
        <circle cx="550" cy="110" r="25" fill="#fde68a" />
        <circle cx="555" cy="105" r="18" fill="#fbbf24" opacity=".7" />
        <rect x="160" y="290" width="80" height="4" rx="2" fill="#93c5fd" opacity=".6" />
        <rect x="560" y="320" width="100" height="4" rx="2" fill="#93c5fd" opacity=".4" />
      </svg>
    );
  }
  if (category === "pdf") {
    return (
      <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="800" height="400" fill="url(#pdf-hero-bg)" />
        <defs>
          <linearGradient id="pdf-hero-bg" x1="0" y1="0" x2="800" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fee2e2" />
            <stop offset="1" stopColor="#fef3c7" />
          </linearGradient>
        </defs>
        <rect x="200" y="40" width="400" height="320" rx="16" fill="white" stroke="#fca5a5" strokeWidth="2" opacity=".9" />
        <path d="M200 100 L600 100" stroke="#fca5a5" strokeWidth="1.5" />
        <rect x="240" y="120" width="320" height="12" rx="6" fill="#fca5a5" opacity=".5" />
        <rect x="240" y="144" width="250" height="10" rx="5" fill="#fca5a5" opacity=".35" />
        <rect x="240" y="164" width="280" height="10" rx="5" fill="#fca5a5" opacity=".35" />
        <rect x="240" y="184" width="200" height="10" rx="5" fill="#fca5a5" opacity=".25" />
        <rect x="240" y="216" width="320" height="10" rx="5" fill="#fca5a5" opacity=".35" />
        <rect x="240" y="236" width="180" height="10" rx="5" fill="#fca5a5" opacity=".25" />
        <rect x="290" y="280" width="220" height="44" rx="22" fill="#ef4444" />
        <rect x="320" y="294" width="160" height="16" rx="8" fill="white" opacity=".85" />
        <path d="M200 68 L240 40 L240 68 Z" fill="#fca5a5" />
      </svg>
    );
  }
  if (category === "generator") {
    return (
      <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="800" height="400" fill="url(#gen-hero-bg)" />
        <defs>
          <linearGradient id="gen-hero-bg" x1="0" y1="0" x2="800" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ede9fe" />
            <stop offset="1" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
        <circle cx="400" cy="200" r="120" fill="#ddd6fe" stroke="#a78bfa" strokeWidth="2" opacity=".8" />
        <path d="M400 100 L420 162 L486 162 L433 200 L454 262 L400 224 L346 262 L367 200 L314 162 L380 162 Z" fill="#7c3aed" opacity=".75" />
        <circle cx="160" cy="100" r="24" fill="#c4b5fd" opacity=".5" />
        <circle cx="640" cy="80" r="18" fill="#a78bfa" opacity=".4" />
        <circle cx="650" cy="310" r="28" fill="#c4b5fd" opacity=".35" />
        <circle cx="140" cy="300" r="18" fill="#a78bfa" opacity=".35" />
        <circle cx="310" cy="60" r="12" fill="#ddd6fe" opacity=".6" />
        <circle cx="500" cy="340" r="10" fill="#c4b5fd" opacity=".5" />
        <path d="M148 108 L158 95" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M632 88 L638 75" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 800 400" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="800" height="400" fill="url(#util-hero-bg)" />
      <defs>
        <linearGradient id="util-hero-bg" x1="0" y1="0" x2="800" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="1" stopColor="#d1fae5" />
        </linearGradient>
      </defs>
      <rect x="80" y="60" width="260" height="130" rx="14" fill="white" stroke="#fbbf24" strokeWidth="1.5" opacity=".9" />
      <rect x="110" y="88" width="200" height="12" rx="6" fill="#f59e0b" opacity=".6" />
      <rect x="110" y="108" width="150" height="10" rx="5" fill="#f59e0b" opacity=".35" />
      <rect x="110" y="126" width="170" height="10" rx="5" fill="#f59e0b" opacity=".35" />
      <rect x="460" y="60" width="260" height="130" rx="14" fill="white" stroke="#6ee7b7" strokeWidth="1.5" opacity=".9" />
      <rect x="490" y="88" width="200" height="12" rx="6" fill="#10b981" opacity=".6" />
      <rect x="490" y="108" width="150" height="10" rx="5" fill="#10b981" opacity=".35" />
      <rect x="490" y="126" width="170" height="10" rx="5" fill="#10b981" opacity=".35" />
      <rect x="80" y="220" width="260" height="130" rx="14" fill="white" stroke="#a5b4fc" strokeWidth="1.5" opacity=".9" />
      <rect x="110" y="248" width="200" height="12" rx="6" fill="#6366f1" opacity=".6" />
      <rect x="110" y="268" width="150" height="10" rx="5" fill="#6366f1" opacity=".35" />
      <rect x="110" y="288" width="170" height="10" rx="5" fill="#6366f1" opacity=".35" />
      <rect x="460" y="220" width="260" height="130" rx="14" fill="white" stroke="#f9a8d4" strokeWidth="1.5" opacity=".9" />
      <rect x="490" y="248" width="200" height="12" rx="6" fill="#ec4899" opacity=".6" />
      <rect x="490" y="268" width="150" height="10" rx="5" fill="#ec4899" opacity=".35" />
      <rect x="490" y="288" width="170" height="10" rx="5" fill="#ec4899" opacity=".35" />
    </svg>
  );
}

function SectionBlock({ section }: { section: BlogSection }) {
  return (
    <div className="mb-8">
      {section.heading && (
        <h2 className="text-xl font-bold text-foreground mb-3 mt-8">{section.heading}</h2>
      )}
      {section.paragraphs?.map((p, i) => (
        <p key={i} className="text-[15px] text-foreground/85 leading-relaxed mb-3">{p}</p>
      ))}
      {section.list && (
        <ul className="space-y-2 mt-3">
          {section.list.map((item, i) => {
            const [bold, rest] = item.includes(":") ? [item.split(":")[0], item.slice(item.indexOf(":") + 1)] : [null, item];
            return (
              <li key={i} className="flex gap-2.5 text-[14px] text-foreground/80 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>
                  {bold ? <><strong className="text-foreground">{bold}:</strong>{rest}</> : item}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {section.numberedList && (
        <ol className="space-y-3 mt-3">
          {section.numberedList.map((item, i) => (
            <li key={i} className="flex gap-3 text-[14px] text-foreground/80 leading-relaxed">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const post = BLOG_POST_MAP.get(slug);

  if (!post) {
    useSEO({ title: "Post Not Found — ToolsHub Blog", description: "This blog post could not be found." });
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
        <Link href="/blog" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          View All Posts →
        </Link>
      </div>
    );
  }

  const coverImageUrl = BLOG_COVER_IMAGES[post.slug] ?? "https://toolshub.app/opengraph.jpg";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    image: { "@type": "ImageObject", url: coverImageUrl, width: 1200, height: 630 },
    author: { "@type": "Organization", name: "ToolsHub", url: "https://toolshub.app" },
    publisher: {
      "@type": "Organization",
      name: "ToolsHub",
      url: "https://toolshub.app",
      logo: { "@type": "ImageObject", url: "https://toolshub.app/opengraph.jpg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://toolshub.app/blog/${post.slug}` },
  };

  const allSections = [...post.sections, ...(BLOG_EXTENSIONS[post.slug] ?? [])];
  const howToSteps = allSections
    .filter((s) => s.numberedList && s.numberedList.length > 0)
    .flatMap((s) =>
      s.numberedList!.map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: step.includes(":") ? step.split(":")[0].trim() : step.substring(0, 60),
        text: step,
      }))
    );

  const howToSchema = howToSteps.length >= 3
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: post.title,
        description: post.excerpt,
        image: { "@type": "ImageObject", url: coverImageUrl },
        step: howToSteps,
        tool: { "@type": "HowToTool", name: "ToolsHub — free browser-based tool" },
      }
    : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://toolshub.app/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://toolshub.app/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://toolshub.app/blog/${post.slug}` },
    ],
  };

  useSEO({
    title: `${post.title} | ToolsHub Blog`,
    description: post.metaDescription,
    canonical: `https://toolshub.app/blog/${post.slug}`,
    ogType: "article",
    ogImage: coverImageUrl,
    schemas: [articleSchema, faqSchema, breadcrumbSchema, ...(howToSchema ? [howToSchema] : [])],
  });

  const relatedPosts = post.relatedSlugs
    .map((s) => BLOG_POST_MAP.get(s))
    .filter(Boolean)
    .slice(0, 3) as typeof BLOG_POSTS;

  const publishDateFmt = new Date(post.publishDate).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Hero image */}
      <div className="w-full rounded-2xl overflow-hidden h-52 sm:h-64 mb-8 border border-border bg-muted">
        {BLOG_COVER_IMAGES[post.slug] ? (
          <img
            src={BLOG_COVER_IMAGES[post.slug]}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <BlogHeroSvg category={post.category} className="w-full h-full" />
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category]}`}>
          {CATEGORY_LABELS[post.category]}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{publishDateFmt}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{post.readMinutes} min read</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-4 leading-snug">
        {post.title}
      </h1>

      {/* Intro excerpt */}
      <p className="text-base text-muted-foreground mb-8 leading-relaxed border-l-2 border-primary/30 pl-4 italic">
        {post.excerpt}
      </p>

      {/* ── CTA Banner (sticky-ish top) ── */}
      <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-10">
        <div>
          <p className="text-sm font-semibold text-foreground">Try the free tool →</p>
          <p className="text-xs text-muted-foreground mt-0.5">No upload, no signup. Everything runs in your browser.</p>
        </div>
        <Link
          href={post.toolHref}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Open Tool <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Content Sections ── */}
      <div className="prose-content">
        {post.sections.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}
        {(BLOG_EXTENSIONS[post.slug] ?? []).map((section, i) => (
          <SectionBlock key={`ext-${i}`} section={section} />
        ))}
      </div>

      {/* ── FAQ Section ── */}
      {post.faq.length > 0 && (
        <div className="mt-10 mb-10">
          <h2 className="text-xl font-bold text-foreground mb-5">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {post.faq.map(({ q, a }, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground mb-1.5">{q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom CTA ── */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center mb-10">
        <h3 className="text-lg font-bold text-foreground mb-2">Ready to try it?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Free, private, browser-based — no upload, no account, no limits.
        </p>
        <Link
          href={post.toolHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          Open the Tool <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Related Posts ── */}
      {relatedPosts.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Related Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rp) => (
              <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block">
                <div className="rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all p-3">
                  <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[rp.category]}`}>
                    {CATEGORY_LABELS[rp.category]}
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1.5 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {rp.title}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{rp.readMinutes} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to blog */}
      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
          ← Back to all posts
        </Link>
      </div>

      {/* JSON-LD injected via useSEO */}
    </div>
  );
}
