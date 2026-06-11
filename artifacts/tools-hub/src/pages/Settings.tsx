import { useState, useEffect } from "react";
import {
  Sun, Moon, Monitor, Shield, Trash2, RotateCcw,
  Keyboard, BarChart2, Settings2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSEO } from "@/hooks/useSEO";
import { useSettings, resetSettings, clearAllData } from "@/hooks/useSettings";
import { getToolCount } from "@/hooks/useToolCounter";

const ALL_TOOLS = [
  { id: "image-compressor",  label: "Image Compressor",  icon: "🗜️" },
  { id: "image-converter",   label: "Image Converter",   icon: "🖼️" },
  { id: "pdf-converter",     label: "PDF Tools",         icon: "📄" },
  { id: "qr-generator",      label: "QR Generator",      icon: "📱" },
  { id: "text-cleaner",      label: "Text Cleaner",      icon: "✂️" },
  { id: "whatsapp-link",     label: "WhatsApp Link",     icon: "💬" },
];

const SHORTCUTS = [
  { keys: ["Alt", "1"], action: "Image Compressor" },
  { keys: ["Alt", "2"], action: "Image Converter" },
  { keys: ["Alt", "3"], action: "PDF Tools" },
  { keys: ["Alt", "4"], action: "QR Generator" },
  { keys: ["Alt", "5"], action: "Text Cleaner" },
  { keys: ["Alt", "6"], action: "WhatsApp Link" },
  { keys: ["Alt", "S"], action: "Settings" },
  { keys: ["Alt", "H"], action: "Home" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <span className="text-primary">{icon}</span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export default function Settings() {
  useSEO({ title: "Settings | ToolsHub", description: "Customize ToolsHub — theme, defaults, shortcuts and more." });

  const { settings, update } = useSettings();
  const [stats, setStats] = useState(() => ALL_TOOLS.map((t) => ({ ...t, count: getToolCount(t.id) })));
  const [clearConfirm, setClearConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const refresh = () => setStats(ALL_TOOLS.map((t) => ({ ...t, count: getToolCount(t.id) })));
    window.addEventListener("toolhub_count_updated", refresh);
    window.addEventListener("toolhub_data_cleared", refresh);
    return () => {
      window.removeEventListener("toolhub_count_updated", refresh);
      window.removeEventListener("toolhub_data_cleared", refresh);
    };
  }, []);

  const totalUses = stats.reduce((s, t) => s + t.count, 0);

  const handleClearAll = () => {
    clearAllData();
    setStats(ALL_TOOLS.map((t) => ({ ...t, count: 0 })));
    setClearConfirm(false);
    setResetConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  const handleResetSettings = () => {
    resetSettings();
    setResetConfirm(false);
  };

  const handleResetStats = () => {
    ALL_TOOLS.forEach((t) => localStorage.removeItem(`toolhub_usage_${t.id}`));
    setStats(ALL_TOOLS.map((t) => ({ ...t, count: 0 })));
    window.dispatchEvent(new CustomEvent("toolhub_data_cleared"));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
      <div className="mb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Settings2 className="w-3.5 h-3.5" /><span>Preferences</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your preferences are saved in the browser automatically.</p>
      </div>

      {cleared && (
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4" />All data cleared successfully.
        </div>
      )}

      {/* ── Appearance ── */}
      <Section icon={<Sun className="w-4 h-4" />} title="Appearance">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Choose how ToolsHub looks on your device.</p>
          <div className="grid grid-cols-3 gap-2">
            {(["light", "system", "dark"] as const).map((t) => {
              const icons = { light: <Sun className="w-4 h-4" />, system: <Monitor className="w-4 h-4" />, dark: <Moon className="w-4 h-4" /> };
              const labels = { light: "Light", system: "System", dark: "Dark" };
              return (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${settings.theme === t ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                >
                  {icons[t]}
                  <span className="text-xs font-semibold">{labels[t]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── Tool Defaults ── */}
      <Section icon={<Settings2 className="w-4 h-4" />} title="Tool Defaults">
        <div className="space-y-5">
          {/* Image Quality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Image Compressor — Default quality</label>
              <span className="text-sm font-mono text-primary">{settings.imageQuality}%</span>
            </div>
            <Slider
              value={[settings.imageQuality]}
              onValueChange={([v]) => update({ imageQuality: v })}
              min={30} max={100} step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Smaller file</span><span>Better quality</span>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* PDF Compress Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">PDF Compress — Default level</label>
            <div className="grid grid-cols-3 gap-2">
              {(["lossless", "balanced", "small"] as const).map((l) => {
                const labels = { lossless: "High Quality", balanced: "Balanced", small: "Smallest" };
                return (
                  <button key={l} onClick={() => update({ pdfCompressLevel: l })} className={`py-2 rounded-lg text-xs font-semibold border transition-all ${settings.pdfCompressLevel === l ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/40"}`}>
                    {labels[l]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Image Output Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Image Converter — Default output format</label>
            <div className="grid grid-cols-3 gap-2">
              {(["jpg", "png", "webp"] as const).map((f) => (
                <button key={f} onClick={() => update({ imageOutputFormat: f })} className={`py-2 rounded-lg text-xs font-bold uppercase border transition-all ${settings.imageOutputFormat === f ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/40"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Auto Download */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Download</p>
              <p className="text-xs text-muted-foreground mt-0.5">Files download automatically after processing</p>
            </div>
            <Toggle checked={settings.autoDownload} onChange={(v) => update({ autoDownload: v })} />
          </div>

          <div className="border-t border-border" />

          {/* Privacy Tips */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Show privacy tips in tools</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show "browser only" reminders inside tools</p>
            </div>
            <Toggle checked={settings.showPrivacyTips} onChange={(v) => update({ showPrivacyTips: v })} />
          </div>
        </div>
      </Section>

      {/* ── Usage Stats ── */}
      <Section icon={<BarChart2 className="w-4 h-4" />} title="Usage Stats">
        <div className="space-y-3">
          <div className="space-y-1">
            {stats.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{t.icon}</span>
                  <span className="text-sm text-foreground">{t.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: totalUses > 0 ? `${Math.min(100, (t.count / Math.max(...stats.map(x => x.count), 1)) * 100)}%` : "0%" }} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-12 text-right">{t.count} use{t.count !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">Total: <span className="font-semibold text-foreground">{totalUses}</span> operations</p>
            <Button size="sm" variant="outline" onClick={handleResetStats} className="text-xs h-7">
              <RotateCcw className="w-3 h-3 mr-1.5" />Reset Stats
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Keyboard Shortcuts ── */}
      <Section icon={<Keyboard className="w-4 h-4" />} title="Keyboard Shortcuts">
        <div className="space-y-1">
          {SHORTCUTS.map((s) => (
            <div key={s.action} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
              <span className="text-sm text-muted-foreground">{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] font-mono font-medium text-foreground">{k}</span>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground pt-2">Use <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">Alt</kbd> + key to navigate between tools from anywhere.</p>
        </div>
      </Section>

      {/* ── Privacy Notice ── */}
      <Section icon={<Shield className="w-4 h-4" />} title="Privacy & Security">
        <div className="space-y-3">
          {[
            { icon: "🔒", text: "All file processing happens entirely in your browser" },
            { icon: "🚫", text: "No files are ever uploaded to any server" },
            { icon: "🧹", text: "Files are never stored — they disappear when you close the tab" },
            { icon: "📊", text: "Only usage counts are saved locally in your browser" },
            { icon: "🆓", text: "Completely free — no account, no tracking, no ads" },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="text-base leading-none mt-0.5">{item.icon}</span>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Danger Zone ── */}
      <Section icon={<Trash2 className="w-4 h-4 text-destructive" />} title="Reset & Clear">
        <div className="space-y-3">
          {/* Reset settings */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Reset settings to defaults</p>
              <p className="text-xs text-muted-foreground">Theme, quality, format — all back to default</p>
            </div>
            {resetConfirm ? (
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleResetSettings} className="text-xs h-7">Confirm</Button>
                <Button size="sm" variant="ghost" onClick={() => setResetConfirm(false)} className="text-xs h-7">Cancel</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setResetConfirm(true)} className="text-xs h-7">
                <RotateCcw className="w-3 h-3 mr-1.5" />Reset
              </Button>
            )}
          </div>

          {/* Clear everything */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/20">
            <div>
              <p className="text-sm font-medium text-foreground">Clear all data</p>
              <p className="text-xs text-muted-foreground">Deletes settings + all usage stats permanently</p>
            </div>
            {clearConfirm ? (
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleClearAll} className="text-xs h-7">Yes, clear</Button>
                <Button size="sm" variant="ghost" onClick={() => setClearConfirm(false)} className="text-xs h-7">Cancel</Button>
              </div>
            ) : (
              <Button size="sm" variant="destructive" onClick={() => setClearConfirm(true)} className="text-xs h-7">
                <Trash2 className="w-3 h-3 mr-1.5" />Clear All
              </Button>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
