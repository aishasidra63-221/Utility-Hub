import { useState } from "react";
import {
  Sun, Moon, Monitor,
  ImageIcon, FileText,
  Download, EyeOff, Eye,
  RotateCcw,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Sliders,
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
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

function Section({ label }: { label: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground px-1 pt-6 pb-2 first:pt-0">
      {label}
    </p>
  );
}

function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
      {children}
    </div>
  );
}

function SettingRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between gap-4 px-5 py-4 ${className}`}>{children}</div>;
}

function RowInfo({ icon: Icon, color = "bg-primary/10 text-primary", label, sub }: {
  icon: React.FC<{ className?: string }>;
  color?: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3.5 min-w-0">
      <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
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

  const handleClearAll = () => { clearAllData(); setClearConfirm(false); showToast("All data cleared."); };
  const handleResetSettings = () => { resetSettings(); setResetConfirm(false); showToast("Settings reset to defaults."); };

  const themeOptions: { value: "light" | "dark" | "system"; icon: React.FC<{ className?: string }>; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-24">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sliders className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your ToolsHub experience</p>
        </div>
      </div>

      {/* ── APPEARANCE ── */}
      <Section label="Appearance" />
      <SettingCard>
        <div className="px-5 py-4">
          <p className="text-sm font-medium text-foreground mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ value, icon: Icon, label }) => {
              const active = settings.theme === value;
              return (
                <button
                  key={value}
                  onClick={() => update({ theme: value })}
                  className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border-2 transition-all duration-150 ${
                    active
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SettingCard>

      {/* ── TOOL DEFAULTS ── */}
      <Section label="Tool Defaults" />
      <SettingCard>
        {/* Image quality */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-3.5">
            <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Image Compression Quality</p>
                <span className="text-sm font-bold text-primary tabular-nums">{localQuality}%</span>
              </div>
              <Slider
                value={[localQuality]}
                onValueChange={([v]) => setLocalQuality(v)}
                onValueCommit={([v]) => update({ imageQuality: v })}
                min={30} max={100} step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">Smaller file</span>
                <span className="text-[10px] text-muted-foreground">Best quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* PDF level */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-3.5">
            <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-2.5">PDF Compression Level</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(["lossless", "balanced", "small"] as const).map((l) => {
                  const labels = { lossless: "High Quality", balanced: "Balanced", small: "Smallest" };
                  const active = settings.pdfCompressLevel === l;
                  return (
                    <button
                      key={l}
                      onClick={() => update({ pdfCompressLevel: l })}
                      className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-150 ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                      }`}
                    >
                      {labels[l]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Auto download */}
        <SettingRow>
          <RowInfo icon={Download} label="Auto Download" sub="Files download automatically after processing" />
          <Toggle checked={settings.autoDownload} onChange={(v) => update({ autoDownload: v })} />
        </SettingRow>

        {/* Privacy tips */}
        <SettingRow>
          <RowInfo
            icon={settings.showPrivacyTips ? Eye : EyeOff}
            label="Privacy tips in tools"
            sub='Show "browser only" reminders inside tools'
          />
          <Toggle checked={settings.showPrivacyTips} onChange={(v) => update({ showPrivacyTips: v })} />
        </SettingRow>
      </SettingCard>

      {/* ── PRIVACY ── */}
      <Section label="Privacy" />
      <SettingCard>
        <div className="px-5 py-4 flex items-start gap-3.5">
          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Your files never leave your device</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              All processing happens 100% in your browser. No files are uploaded to any server. No account required. No tracking. Completely free.
            </p>
          </div>
        </div>
      </SettingCard>

      {/* ── RESET & CLEAR ── */}
      <Section label="Reset & Clear" />
      <SettingCard>
        <SettingRow>
          <RowInfo icon={RotateCcw} label="Reset to Defaults" sub="Restore all settings to original values" />
          {resetConfirm ? (
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="destructive" onClick={handleResetSettings} className="text-xs h-8 px-3 rounded-lg">Confirm</Button>
              <Button size="sm" variant="ghost" onClick={() => setResetConfirm(false)} className="text-xs h-8 px-3 rounded-lg">Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setResetConfirm(true)} className="text-xs h-8 px-3 shrink-0 rounded-lg">Reset</Button>
          )}
        </SettingRow>
        <SettingRow>
          <RowInfo icon={Trash2} color="bg-destructive/10 text-destructive" label="Clear All Data" sub="Deletes all settings and usage stats" />
          {clearConfirm ? (
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="destructive" onClick={handleClearAll} className="text-xs h-8 px-3 rounded-lg">Yes, clear</Button>
              <Button size="sm" variant="ghost" onClick={() => setClearConfirm(false)} className="text-xs h-8 px-3 rounded-lg">Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setClearConfirm(true)} className="text-xs h-8 px-3 shrink-0 rounded-lg">Clear</Button>
          )}
        </SettingRow>
      </SettingCard>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-foreground text-background text-sm px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{toast}
        </div>
      )}
    </div>
  );
}
