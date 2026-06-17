import { useEffect } from "react";
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

    const softwareAppSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.title,
      url: `${origin}${tool.href}`,
      description: tool.tagline,
      applicationCategory: "WebApplication",
      applicationSubCategory: "UtilityApplication",
      operatingSystem: "Any (browser-based)",
      browserRequirements: "Requires a modern browser with JavaScript enabled",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      featureList: tool.features.join(", "),
      screenshot: `${origin}/opengraph.jpg`,
      softwareHelp: { "@type": "CreativeWork", url: `${origin}/blog` },
      provider: {
        "@type": "Organization",
        name: "ToolsHub",
        url: origin,
      },
    };
    injectSchema("schema-webapp-tool", softwareAppSchema);

    return () => {
      removeSchema("schema-faq-tool");
      removeSchema("schema-webapp-tool");
    };
  }, [tool]);

  return null;
}
