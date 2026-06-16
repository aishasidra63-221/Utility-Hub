import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { HelpCircle, ChevronDown, Search } from "lucide-react";

const CATEGORIES = [
  {
    label: "Privacy & Security",
    color: "bg-emerald-500/10 text-emerald-600",
    items: [
      {
        q: "Are my files ever uploaded to a server?",
        a: "No — never. Every tool on ToolsHub processes files entirely inside your web browser, on your own device. Nothing is sent to our servers or anywhere else on the internet. Your files stay 100% private, always.",
      },
      {
        q: "Can ToolsHub see the content of my files?",
        a: "No. Because all processing happens locally in your browser, we have no technical ability to see your files. There is no upload step at all — the files never travel over the internet.",
      },
      {
        q: "What data does ToolsHub store?",
        a: "We store only your preferences in your browser's local storage: theme choice (light/dark), default quality setting, favourite tools, language preference, and an anonymous per-tool usage counter. All of this stays on your device and is never transmitted anywhere. You can clear it anytime from Settings → Clear All Data.",
      },
      {
        q: "Does ToolsHub use cookies or tracking?",
        a: "We do not use advertising cookies or cross-site tracking scripts. If we use any analytics at all, it is strictly anonymous (no personal identifiers, no device fingerprinting, no file content) and only to understand overall site performance.",
      },
      {
        q: "Is ToolsHub safe to use with sensitive documents?",
        a: "Yes. Because files are processed entirely in your browser and never leave your device, it is safe to use ToolsHub with confidential documents, personal photos, financial PDFs, or any other sensitive content.",
      },
    ],
  },
  {
    label: "Getting Started",
    color: "bg-blue-500/10 text-blue-600",
    items: [
      {
        q: "Is ToolsHub free to use?",
        a: "Yes, completely and permanently free. No hidden charges, no subscription tiers, no credit card, no trial period. Every tool is available to everyone, no strings attached.",
      },
      {
        q: "Do I need to create an account?",
        a: "No account is needed. There is no signup, no login, and no email address required — ever. Just open any tool and start using it immediately.",
      },
      {
        q: "Can I use ToolsHub on my phone or tablet?",
        a: "Yes! ToolsHub is fully responsive and works on any modern smartphone, tablet, or desktop browser. No app download is needed — it runs directly in your mobile browser.",
      },
      {
        q: "Does ToolsHub work offline?",
        a: "Once the page has fully loaded in your browser, most tools will continue to work even if your internet connection drops, since all processing is done locally. You do need an internet connection for the initial page load.",
      },
    ],
  },
  {
    label: "Image Tools",
    color: "bg-violet-500/10 text-violet-600",
    items: [
      {
        q: "Which image formats are supported?",
        a: "Most image tools support JPG, PNG, and WebP. The HEIC Converter specifically converts Apple HEIC/HEIF photos to JPG or PNG. The Image Converter lets you change between JPG, PNG, and WebP in bulk.",
      },
      {
        q: "Why is my compressed image larger than the original?",
        a: "This can happen when the original file is already well-optimised (for example, a small PNG with very few colours). Try lowering the quality slider further, or switch to WebP format, which typically achieves better compression for the same visual quality.",
      },
      {
        q: "How does Background Remover work?",
        a: "Background Remover uses advanced AI to detect the subject in your photo and remove the background, producing a transparent PNG. The entire AI model runs directly in your browser — your photo is never sent anywhere.",
      },
      {
        q: "What does EXIF Stripper do?",
        a: "Photos taken on phones and cameras embed hidden metadata called EXIF data — this can include your GPS location, device model, and shooting date. EXIF Stripper removes all this metadata so you can share photos without accidentally sharing personal information.",
      },
      {
        q: "Can I process multiple images at once?",
        a: "Yes. Image Compressor, Image Converter, and Image Resizer all support batch processing. You can drag and drop multiple files at once and download them all in one go.",
      },
    ],
  },
  {
    label: "PDF Tools",
    color: "bg-rose-500/10 text-rose-600",
    items: [
      {
        q: "What can the PDF Converter do?",
        a: "The PDF Converter can: convert images (JPG, PNG, WebP) into a single PDF, extract pages from a PDF as images, merge multiple PDFs into one, split a PDF into individual pages, compress a PDF to reduce file size, add a text watermark, and add page numbers. All in one tool.",
      },
      {
        q: "Can I sign documents without printing them?",
        a: "Yes — use E-Signature. You can draw your signature with a mouse or finger, type it in a stylised font, or upload an image of your handwritten signature, then place it on any PDF page and download the signed document.",
      },
      {
        q: "Can I extract text from a scanned PDF or image?",
        a: "Yes. The OCR tool (Optical Character Recognition) can read text from images and scanned documents. Select your file and it will detect and extract all readable text, which you can copy or download.",
      },
      {
        q: "How large a PDF can I process?",
        a: "Since all processing happens in your browser, the practical limit depends on your device's available memory. Most modern devices handle PDFs up to 50–100 MB comfortably. Very large files may be slower on older or low-memory devices.",
      },
    ],
  },
  {
    label: "Generators & Utilities",
    color: "bg-amber-500/10 text-amber-600",
    items: [
      {
        q: "What types of QR codes can I generate?",
        a: "The QR Generator creates QR codes from any text, URL, phone number, or message. You can customise the colour, size, error-correction level, and download the result as a PNG or SVG.",
      },
      {
        q: "How does the Password Generator work?",
        a: "The Password Generator creates cryptographically strong random passwords entirely in your browser. You choose the length (6–64 characters) and which character sets to include (uppercase, lowercase, numbers, symbols). No passwords are ever sent anywhere.",
      },
      {
        q: "What is the WhatsApp Link Generator?",
        a: "It creates a direct wa.me link that opens a WhatsApp chat to any phone number with a pre-filled message. Useful for adding a WhatsApp contact button to your website or sharing a quick link with customers.",
      },
      {
        q: "What does the Resume Builder produce?",
        a: "The Resume Builder lets you fill in your details and generates a clean, professional one-page resume that you can download as a PDF, ready to send to employers.",
      },
    ],
  },
  {
    label: "Troubleshooting",
    color: "bg-slate-500/10 text-slate-600",
    items: [
      {
        q: "A tool is running slowly on my device — what can I do?",
        a: "Some tools (like AI-powered background removal, photo colouriser, and face blur) run sophisticated models directly in your browser and require significant processing power. For best performance, use a modern browser (Chrome, Edge, or Firefox), close other tabs, and ensure your device is plugged in or has sufficient battery.",
      },
      {
        q: "The tool output doesn't look right. What should I do?",
        a: "Try refreshing the page and processing the file again. If the problem persists, check that your file is not corrupted and is in a supported format. For AI tools, results may vary with unusual or complex images.",
      },
      {
        q: "How do I clear my saved preferences and data?",
        a: "Go to Settings (hamburger menu → Settings) and use 'Reset to Defaults' to restore all settings to their original values, or 'Clear All Data' to erase everything including favourites and usage counts.",
      },
      {
        q: "How do I report a bug or suggest a new tool?",
        a: "We welcome feedback! Use the Settings page to send us a message, or email us at support@toolshub.app. Bug reports with steps to reproduce are especially helpful.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        open ? "border-primary/30 bg-card shadow-sm shadow-primary/5" : "border-border bg-card hover:border-primary/20"
      }`}
    >
      <button
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground leading-snug">{q}</span>
        <ChevronDown
          className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-primary" : "text-muted-foreground"
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? "max-h-96" : "max-h-0"}`}
      >
        <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState("");

  useSEO({
    title: "FAQ — ToolsHub",
    description: "Frequently asked questions about ToolsHub — privacy, file formats, limits, and more.",
  });

  const query = search.trim().toLowerCase();
  const filtered = query
    ? CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(query) ||
            item.a.toLowerCase().includes(query)
        ),
      })).filter((cat) => cat.items.length > 0)
    : CATEGORIES;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-20">

      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 px-6 py-8">
        <div className="absolute top-4 right-5 opacity-8 pointer-events-none">
          <HelpCircle className="w-24 h-24 text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center border border-primary/20">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Frequently Asked Questions</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{CATEGORIES.reduce((s, c) => s + c.items.length, 0)} answers across {CATEGORIES.length} topics</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            Everything you need to know about ToolsHub — privacy, tools, file formats, and more.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Search questions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Categories */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <HelpCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No questions match "<strong className="text-foreground">{search}</strong>"</p>
        </div>
      ) : (
        <div className="space-y-10">
          {filtered.map((cat) => (
            <div key={cat.label}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${cat.color}`}>
                  {cat.label}
                </span>
              </div>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Still have questions */}
      <div className="mt-12 rounded-2xl border border-border bg-card px-5 py-5 text-center">
        <HelpCircle className="w-6 h-6 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground mb-1">Still have a question?</p>
        <p className="text-xs text-muted-foreground mb-3">
          Can't find what you're looking for? Drop us a message.
        </p>
        <a
          href="mailto:support@toolshub.app"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Contact Support
        </a>
      </div>

    </div>
  );
}
