import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Settings, Moon, Sun, Globe, Shield, Rocket, Info, X,
  ChevronRight, Check, ArrowLeft,
} from "lucide-react";

import { useTheme } from "@/hooks/useSettings";
import { ToolsHubIcon } from "@/components/ToolsHubLogo";
import { useLang } from "@/contexts/LangContext";
import type { LangCode } from "@/lib/i18n";
import { TOOL_BY_HREF, NON_TOOL_PATHS } from "@/lib/toolsData";
import { ToolAEOSection } from "@/components/ToolAEOSection";
import { RelatedTools } from "@/components/RelatedTools";
import { addRecentTool } from "@/hooks/useRecentTools";

// ─── Language list ───────────────────────────────────────────────────────────
const LANGUAGES: { code: LangCode; label: string; flag: string }[] = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी",     flag: "🇮🇳" },
  { code: "es", label: "Español",   flag: "🇪🇸" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
  { code: "ar", label: "العربية",   flag: "🇸🇦" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "bn", label: "বাংলা",     flag: "🇧🇩" },
  { code: "ru", label: "Русский",   flag: "🇷🇺" },
  { code: "ja", label: "日本語",    flag: "🇯🇵" },
  { code: "zh", label: "中文",      flag: "🇨🇳" },
  { code: "de", label: "Deutsch",   flag: "🇩🇪" },
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
];

const tools = [
  { href: "/image-compressor",   label: "Image Compressor" },
  { href: "/image-converter",    label: "Image Converter" },
  { href: "/image-resizer",      label: "Image Resizer" },
  { href: "/image-cropper",      label: "Image Cropper" },
  { href: "/password-generator", label: "Password Generator" },
  { href: "/unit-converter",     label: "Unit Converter" },
  { href: "/color-palette",      label: "Color Palette" },
  { href: "/heic-converter",     label: "HEIC to JPG" },
  { href: "/pdf-converter",      label: "PDF Tools" },
  { href: "/e-signature",        label: "E-Signature" },
  { href: "/pdf-annotator",      label: "PDF Annotator" },
  { href: "/ocr-tool",           label: "OCR" },
  { href: "/qr-generator",       label: "QR Generator" },
  { href: "/text-cleaner",       label: "Text Cleaner" },
  { href: "/whatsapp-link",      label: "WhatsApp Link" },
  { href: "/resume-builder",     label: "Resume Builder" },
  { href: "/background-remover", label: "Background Remover" },
  { href: "/word-counter",       label: "Word Counter" },
  { href: "/video-to-gif",       label: "Video to GIF" },
  { href: "/pomodoro-timer",     label: "Pomodoro Timer" },
  { href: "/exif-stripper",      label: "EXIF Stripper" },
  { href: "/color-picker",       label: "Color Picker" },
];

// ─── Hamburger icon (3 lines, animated to X) ─────────────────────────────────
function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex flex-col justify-center items-end w-5 h-5 gap-[5px]">
      <span
        className="block h-[1.5px] bg-current rounded-full transition-all duration-300 origin-right"
        style={{
          width: open ? "18px" : "18px",
          transform: open ? "translateY(6.5px) rotate(-45deg)" : "none",
        }}
      />
      <span
        className="block h-[1.5px] bg-current rounded-full transition-all duration-300"
        style={{
          width: open ? "0px" : "13px",
          opacity: open ? 0 : 1,
        }}
      />
      <span
        className="block h-[1.5px] bg-current rounded-full transition-all duration-300 origin-right"
        style={{
          width: open ? "18px" : "18px",
          transform: open ? "translateY(-6.5px) rotate(45deg)" : "none",
        }}
      />
    </span>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [langOpen, setLangOpen]     = useState(false);
  const { lang, setLang, t }        = useLang();
  const [location] = useLocation();
  const drawerRef  = useRef<HTMLDivElement>(null);

  // ── Theme apply (instant — no flash) ──
  useEffect(() => {
    const el = document.documentElement;
    el.classList.add("no-transitions");
    el.classList.toggle("dark", theme === "dark");
    void el.offsetHeight; // force reflow so transitions are suppressed this frame
    el.classList.remove("no-transitions");
  }, [theme]);

  // ── Scroll shadow ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close drawer on navigation ──
  useEffect(() => { setDrawerOpen(false); setLangOpen(false); }, [location]);

  // ── Track recently used tools ──
  const toolData = NON_TOOL_PATHS.has(location) ? null : (TOOL_BY_HREF.get(location) ?? null);
  useEffect(() => {
    if (toolData) addRecentTool(location);
  }, [location, toolData]);

  // ── Close drawer on outside click ──
  useEffect(() => {
    if (!drawerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [drawerOpen]);

  // ── Body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const isDark = theme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── HEADER ── */}
      <header
        className={`sticky top-0 z-50 border-b border-border transition-all duration-200 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl shadow-sm"
            : "bg-background/95 backdrop-blur-md"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors group flex-shrink-0"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ToolsHubIcon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-extrabold tracking-tight">ToolsHub</span>
          </Link>

          {/* Desktop nav tools */}
          <nav
            className="hidden lg:flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-1 min-w-0"
            aria-label="Tools navigation"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0, black 8px, black calc(100% - 8px), transparent 100%)",
            }}
          >
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  location === tool.href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {tool.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Theme toggle + Hamburger */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {isDark
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
              }
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <BurgerIcon open={drawerOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* ── DRAWER OVERLAY ── */}
      <div
        className="fixed inset-0 z-[60] transition-all duration-300"
        style={{
          pointerEvents: drawerOpen ? "auto" : "none",
          background: drawerOpen ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0)",
          backdropFilter: drawerOpen ? "blur(6px)" : "blur(0px)",
          WebkitBackdropFilter: drawerOpen ? "blur(6px)" : "blur(0px)",
          opacity: drawerOpen ? 1 : 0,
        }}
        aria-hidden={!drawerOpen}
      />

      {/* ── DRAWER PANEL ── */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 z-[70] w-[300px] max-w-[85vw] bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
        aria-modal="true"
        role="dialog"
        aria-label="Main menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <ToolsHubIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-foreground leading-none">ToolsHub</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t("nav.tagline")}</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme toggle in drawer */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("nav.appearance")}</p>
          <div className="flex rounded-xl bg-muted p-1 gap-1">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  theme === t
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "light" && <Sun className="w-3 h-3" />}
                {t === "dark"  && <Moon className="w-3 h-3" />}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language selector */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("nav.language")}</p>
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-muted hover:bg-accent transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{currentLang.flag} {currentLang.label}</span>
            </div>
            <ChevronRight
              className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200"
              style={{ transform: langOpen ? "rotate(90deg)" : "none" }}
            />
          </button>

          {/* Language list */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: langOpen ? "260px" : "0px", opacity: langOpen ? 1 : 0 }}
          >
            <div className="mt-1.5 rounded-xl border border-border bg-card overflow-y-auto max-h-[240px]">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setLangOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <span>{l.flag}</span>
                    <span className="font-medium">{l.label}</span>
                  </span>
                  {lang === l.code && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 my-1 border-t border-border" />

        {/* Navigation links */}
        <nav className="px-4 py-2 flex flex-col gap-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 mt-1">{t("nav.more")}</p>

          {[
            { href: "/settings", label: t("nav.settings"), icon: <Settings className="w-4 h-4" />, desc: t("nav.settings_desc") },
            { href: "/future",   label: t("nav.future"),   icon: <Rocket className="w-4 h-4" />,   desc: t("nav.future_desc") },
            { href: "/security", label: t("nav.security"), icon: <Shield className="w-4 h-4" />,   desc: t("nav.security_desc") },
            { href: "/about",    label: t("nav.about"),    icon: <Info className="w-4 h-4" />,     desc: t("nav.about_desc") },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors group ${
                location === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <span className={`flex-shrink-0 ${location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                {item.icon}
              </span>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold leading-none">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.desc}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[11px] text-muted-foreground text-center">
            © {new Date().getFullYear()} ToolsHub · {t("nav.footer_copy")}
          </p>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className="flex-1">
        {location !== "/" && (
          <div className="max-w-6xl mx-auto px-4 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              {t("nav.back")}
            </Link>
          </div>
        )}
        {children}
        {toolData && (
          <>
            <RelatedTools currentHref={location} relatedHrefs={toolData.related} />
            <ToolAEOSection tool={toolData} />
          </>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-card/50 pt-10 pb-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <ToolsHubIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-foreground">ToolsHub</span>
              <span className="text-xs text-muted-foreground">— {t("nav.tagline")}</span>
            </div>
            <nav className="flex flex-wrap gap-x-5 gap-y-1.5" aria-label="Footer tools">
              {tools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  {tool.label}
                </Link>
              ))}
              <Link href="/settings"  className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("nav.settings")}</Link>
              <Link href="/future"    className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("nav.future")}</Link>
              <Link href="/security"  className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("nav.security")}</Link>
              <Link href="/about"     className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("nav.about")}</Link>
            </nav>
          </div>

          <div className="border-t border-border" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              © {new Date().getFullYear()} ToolsHub. All rights reserved.
            </p>
            <nav className="flex items-center gap-5 order-1 sm:order-2" aria-label="Legal">
              <Link href="/faq"            className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">{t("nav.faq")}</Link>
              <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">{t("nav.privacy")}</Link>
              <Link href="/terms"          className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">{t("nav.terms")}</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
