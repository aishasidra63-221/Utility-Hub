import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useSettings";
import { ToolsHubIcon } from "@/components/ToolsHubLogo";

const tools = [
  { href: "/image-compressor", label: "Image Compressor" },
  { href: "/image-converter",  label: "Image Converter" },
  { href: "/image-resizer",    label: "Image Resizer" },
  { href: "/image-cropper",        label: "Image Cropper" },
  { href: "/password-generator",  label: "Password Generator" },
  { href: "/unit-converter",       label: "Unit Converter" },
  { href: "/color-palette",       label: "Color Palette" },
  { href: "/heic-converter",      label: "HEIC to JPG" },
  { href: "/pdf-converter",       label: "PDF Tools" },
  { href: "/e-signature",         label: "E-Signature" },
  { href: "/pdf-annotator",       label: "PDF Annotator" },
  { href: "/ocr-tool",            label: "OCR" },
  { href: "/qr-generator",     label: "QR Generator" },
  { href: "/text-cleaner",     label: "Text Cleaner" },
  { href: "/whatsapp-link",    label: "WhatsApp Link" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => document.documentElement.classList.toggle("dark", e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-50 border-b border-border transition-all duration-200 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl shadow-sm"
            : "bg-background/95 backdrop-blur-md"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors group"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ToolsHubIcon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-extrabold tracking-tight">ToolsHub</span>
          </Link>

          {/* Desktop nav — only on large screens */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Tools navigation">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                data-testid={`nav-link-${tool.href.slice(1)}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  location === tool.href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {tool.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-settings"
                aria-label="Settings"
                className={`w-8 h-8 ${location === "/settings" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            {/* Hamburger — visible on mobile & tablet, hidden on large screens */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-nav-link-${tool.href.slice(1)}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === tool.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {tool.label}
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                location === "/settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card/50 pt-10 pb-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Top row: logo + tools nav */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <ToolsHubIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-foreground">ToolsHub</span>
              <span className="text-xs text-muted-foreground">— Free online tools, zero friction</span>
            </div>
            <nav className="flex flex-wrap gap-x-5 gap-y-1.5" aria-label="Footer tools">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {tool.label}
                </Link>
              ))}
              <Link href="/settings" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Settings
              </Link>
            </nav>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Bottom row: legal links + copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              © {new Date().getFullYear()} ToolsHub. All rights reserved.
            </p>
            <nav className="flex items-center gap-5 order-1 sm:order-2" aria-label="Legal">
              <Link href="/faq" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                FAQ
              </Link>
              <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                Terms &amp; Conditions
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
