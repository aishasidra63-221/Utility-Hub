import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { HelpCircle, ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Are my files uploaded to any server?",
    a: "No. Every tool on ToolsHub runs entirely inside your browser. Your files are processed locally on your device and are never sent to any server. This means your data stays 100% private.",
  },
  {
    q: "Is ToolsHub free?",
    a: "Yes, completely free — no hidden charges, no subscription, no credit card required. Just open the tool and use it.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account is needed. There is no signup, no login, and no email required. Open any tool and start using it instantly.",
  },
  {
    q: "Which file formats are supported?",
    a: "Image tools support JPG, PNG, and WebP. The PDF Converter supports PDF files and can convert them to images or merge images into a PDF. QR Generator works with any text or URL. WhatsApp Link works with any phone number.",
  },
  {
    q: "How large a file can I process?",
    a: "Since processing happens in your browser, the limit depends on your device's RAM. Most modern devices handle files up to 50–100 MB comfortably. Very large files may be slow on older devices.",
  },
  {
    q: "Why is my compressed image larger than the original?",
    a: "This can happen when the original image is already highly optimized (e.g., a small PNG with few colors). Try lowering the quality slider further, or switch to a different format like WebP for better compression ratios.",
  },
  {
    q: "Can I use ToolsHub on my phone?",
    a: "Yes! ToolsHub is fully mobile-friendly and works on any modern smartphone or tablet browser — no app download needed.",
  },
  {
    q: "Does ToolsHub work offline?",
    a: "Once the page has loaded, most tools work offline since all processing is done in your browser. However, you need an internet connection to initially load the page.",
  },
  {
    q: "How do I report a bug or suggest a new tool?",
    a: "Go to Settings (gear icon in the top-right) and use the feedback option, or reach out via our public repository.",
  },
  {
    q: "Is the source code open source?",
    a: "ToolsHub uses several open-source libraries (jszip, browser-image-compression, pdf-lib, pdfjs-dist, qrcode) under their respective licenses. Check the Settings page for details.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-border rounded-xl overflow-hidden transition-colors duration-200 ${open ? "bg-card" : "bg-card hover:border-primary/30"}`}>
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground leading-snug">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  useSEO({
    title: "FAQ — ToolsHub",
    description: "Frequently asked questions about ToolsHub — privacy, file formats, limits, and more.",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <HelpCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Frequently Asked Questions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Everything you need to know about ToolsHub</p>
        </div>
      </div>

      <div className="space-y-3">
        {FAQS.map((item) => (
          <FAQItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
