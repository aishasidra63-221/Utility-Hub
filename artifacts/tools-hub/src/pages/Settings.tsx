import { useState } from "react";
import {
  Sun, Moon, Monitor,
  ImageIcon, FileText, ArrowLeftRight,
  Download, EyeOff, Eye,
  RotateCcw,
  ShieldCheck,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSEO } from "@/hooks/useSEO";
import { useSettings, resetSettings, clearAllData } from "@/hooks/useSettings";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${checked ? "bg-primary" : "bg-input"}`}
    >
      <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-background shadow-md transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">{children}</div>;
}

function SectionLabel({ label }: { label: string }) {
  return <p className="px-4 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>;
}

function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between gap-4 px-4 py-3.5 ${className}`}>{children}</div>;
}

function RowLabel({ icon: Icon, label, sub }: { icon: React.FC<{ className?: string }>; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-none">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

export default function Settings() {
  useSEO({ title: "Settings | ToolsHub", description: "Customize ToolsHub defaults, theme, shortcuts, and privacy." });

  const { settings, update } = useSettings();
  const [localQuality, setLocalQuality] = useState(() => settings.imageQuality);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const handleClearAll = () => {
    clearAllData();
    setClearConfirm(false);
    showToast("All data cleared.");
  };

  const handleResetSettings = () => {
    resetSettings();
    setResetConfirm(false);
    showToast("Settings reset to defaults.");
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-1 pb-20">
      <h1 className="text-2xl font-bold tracking-tight text-foreground px-1 mb-4">Settings</h1>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-foreground text-background text-sm px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{toast}
        </div>
      )}

      {/* ── APPEARANCE ── */}
      <SectionLabel label="Appearance" />
      <Card>
        <Row>
          <RowLabel icon={Sun} label="Theme" sub="How ToolsHub looks on your device" />
          <div className="flex items-center gap-1 shrink-0 bg-muted rounded-lg p-1">
            {(["light", "system", "dark"] as const).map((t) => {
              const Icon = t === "light" ? Sun : t === "system" ? Monitor : Moon;
              return (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  title={t.charAt(0).toUpperCase() + t.slice(1)}
                  className={`flex items-center justify-center w-8 h-7 rounded-md transition-all ${settings.theme === t ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </Row>
      </Card>

      {/* ── TOOL DEFAULTS ── */}
      <SectionLabel label="Tool Defaults" />
      <Card>
        {/* Image quality */}
        <div className="px-4 py-3.5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">Image Compression Quality</p>
                <span className="text-sm font-semibold text-primary tabular-nums">{localQuality}%</span>
              </div>
              <Slider
                value={[localQuality]}
                onValueChange={([v]) => setLocalQuality(v)}
                onValueCommit={([v]) => update({ imageQuality: v })}
                min={30} max={100} step={5}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">Smaller file</span>
                <span className="text-[10px] text-muted-foreground">Best quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* PDF level */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-2">PDF Compression Level</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(["lossless", "balanced", "small"] as const).map((l) => {
                  const labels = { lossless: "High Quality", balanced: "Balanced", small: "Smallest" };
                  return (
                    <button key={l} onClick={() => update({ pdfCompressLevel: l })} className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${settings.pdfCompressLevel === l ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/50"}`}>
                      {labels[l]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Image output format */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-2">Image Converter Output Format</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(["jpg", "png", "webp"] as const).map((f) => (
                  <button key={f} onClick={() => update({ imageOutputFormat: f })} className={`py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${settings.imageOutputFormat === f ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/50"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Auto download */}
        <Row>
          <RowLabel icon={Download} label="Auto Download" sub="Files download automatically after processing" />
          <Toggle checked={settings.autoDownload} onChange={(v) => update({ autoDownload: v })} />
        </Row>

        {/* Privacy tips */}
        <Row>
          <RowLabel icon={settings.showPrivacyTips ? Eye : EyeOff} label="Privacy tips in tools" sub={'Show "browser only" reminders inside tools'} />
          <Toggle checked={settings.showPrivacyTips} onChange={(v) => update({ showPrivacyTips: v })} />
        </Row>
      </Card>

      {/* ── PRIVACY ── */}
      <SectionLabel label="Privacy" />
      <Card>
        <div className="px-4 py-3.5 flex items-start gap-3">
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Your files never leave your device</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All processing happens 100% in your browser. No files are uploaded to any server. No account required. No tracking. Completely free.
            </p>
          </div>
        </div>
      </Card>

      {/* ── RESET & CLEAR ── */}
      <SectionLabel label="Reset & Clear" />
      <Card>
        <Row>
          <RowLabel icon={RotateCcw} label="Reset to Defaults" sub="Restore all settings to original values" />
          {resetConfirm ? (
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="destructive" onClick={handleResetSettings} className="text-xs h-7 px-2.5">Confirm</Button>
              <Button size="sm" variant="ghost" onClick={() => setResetConfirm(false)} className="text-xs h-7 px-2.5">Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setResetConfirm(true)} className="text-xs h-7 shrink-0">Reset</Button>
          )}
        </Row>
        <Row>
          <RowLabel icon={Trash2} label="Clear All Data" sub="Deletes all settings and usage stats" />
          {clearConfirm ? (
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="destructive" onClick={handleClearAll} className="text-xs h-7 px-2.5">Yes, clear</Button>
              <Button size="sm" variant="ghost" onClick={() => setClearConfirm(false)} className="text-xs h-7 px-2.5">Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setClearConfirm(true)} className="text-xs h-7 shrink-0">Clear</Button>
          )}
        </Row>
      </Card>
    </div>
  );
}
