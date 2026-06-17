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

  return null;
}
