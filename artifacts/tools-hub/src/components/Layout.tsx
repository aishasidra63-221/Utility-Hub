import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Sun, Moon, Wrench, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  { href: "/image-compressor", label: "Image Compressor" },
  { href: "/pdf-converter", label: "PDF Converter" },
  { href: "/qr-generator", label: "QR Generator" },
  { href: "/text-cleaner", label: "Text Cleaner" },
  { href: "/whatsapp-link", label: "WhatsApp Link" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors">
            <Wrench className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold tracking-tight">ToolsHub</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Tools navigation">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                data-testid={`nav-link-${tool.href.slice(1)}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location === tool.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {tool.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDark(!dark)}
              data-testid="button-toggle-theme"
              aria-label="Toggle dark mode"
              className="w-8 h-8"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-8 h-8"
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
          <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-nav-link-${tool.href.slice(1)}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === tool.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {tool.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">ToolsHub</span>
              <span className="text-xs text-muted-foreground">— Free online tools, zero friction</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1" aria-label="Footer tools">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {tool.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
