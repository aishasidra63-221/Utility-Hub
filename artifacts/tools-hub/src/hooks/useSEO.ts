import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  schemas?: object[];
  keywords?: string;
}

function setMeta(name: string, content: string, attr = "name") {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra
    ? `link[rel="${rel}"]${Object.entries(extra).map(([k]) => `[${k}]`).join("")}`
    : `link[rel="${rel}"]`;
  let el = document.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.href = href;
}

const HREFLANG_CODES = [
  { lang: "en",    hreflang: "en" },
  { lang: "hi",    hreflang: "hi" },
  { lang: "es",    hreflang: "es" },
  { lang: "fr",    hreflang: "fr" },
  { lang: "ar",    hreflang: "ar" },
  { lang: "pt",    hreflang: "pt-BR" },
  { lang: "bn",    hreflang: "bn" },
  { lang: "ru",    hreflang: "ru" },
  { lang: "ja",    hreflang: "ja" },
  { lang: "zh",    hreflang: "zh-CN" },
  { lang: "de",    hreflang: "de" },
  { lang: "id",    hreflang: "id" },
];

function injectHreflang(canonicalUrl: string) {
  const existing = document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]');
  existing.forEach((el) => el.remove());

  HREFLANG_CODES.forEach(({ hreflang }) => {
    const el = document.createElement("link");
    el.rel = "alternate";
    el.setAttribute("hreflang", hreflang);
    el.href = canonicalUrl;
    document.head.appendChild(el);
  });

  const xDefault = document.createElement("link");
  xDefault.rel = "alternate";
  xDefault.setAttribute("hreflang", "x-default");
  xDefault.href = canonicalUrl;
  document.head.appendChild(xDefault);
}

function removeHreflang() {
  document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
}

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

function removeSchema(id: string) {
  document.getElementById(id)?.remove();
}

export function useSEO({
  title,
  description,
  canonical,
  ogImage = "/opengraph.jpg",
  ogType = "website",
  schemas = [],
  keywords,
}: SEOProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const url = canonical ?? window.location.href;
    const absImg = ogImage.startsWith("http") ? ogImage : `${window.location.origin}${ogImage}`;

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);

    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:url", url, "property");
    setMeta("og:image", absImg, "property");
    setMeta("og:site_name", "ToolsHub", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", absImg);

    setLink("canonical", url);

    injectHreflang(url);

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ToolsHub",
      url: window.location.origin,
      description: "Free browser-based tools — image, PDF, generators and utilities. No upload, no signup.",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${window.location.origin}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    };
    injectSchema("schema-website", websiteSchema);

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
        { "@type": "ListItem", position: 2, name: title.split("—")[0].trim(), item: url },
      ],
    };
    injectSchema("schema-breadcrumb", breadcrumbSchema);

    schemas.forEach((schema, i) => {
      injectSchema(`schema-custom-${i}`, schema);
    });

    return () => {
      document.title = prevTitle || "ToolsHub — Free Online Tools";
      removeSchema("schema-breadcrumb");
      schemas.forEach((_s, i) => removeSchema(`schema-custom-${i}`));
      removeHreflang();
    };
  }, [title, description, canonical, ogImage, ogType, schemas, keywords]);
}
