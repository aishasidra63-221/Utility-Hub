import { useState } from "react";
import {
  Sun, Moon,
  ImageIcon, FileText,
  Download, EyeOff, Eye,
  RotateCcw,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Sliders,
  Sparkles,
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
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        checked
          ? "bg-gradient-to-r from-primary to-primary/80 shadow-md shadow-primary/25"
          : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
          checked ? "translate-x-6 shadow-lg" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionLabel({ label, icon: Icon }: { label: string; icon?: React.FC<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 pt-8 pb-3 first:pt-0">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border/60">
      {children}
    </div>
  );
}

function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}

function RowLabel({
  icon: Icon,
  color = "bg-primary/10 text-primary",
  label,
  sub,
}: {
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handleClearAll = () => { clearAllData(); setClearConfirm(false); showToast("All data cleared."); };
  const handleResetSettings = () => { resetSettings(); setResetConfirm(false); showToast("Settings reset to defaults."); };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-24">

      {/* ── PAGE HEADER ── */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 px-6 py-7">
        <div className="absolute top-3 right-4 opacity-10 pointer-events-none select-none">
          <Sparkles className="w-20 h-20 text-primary" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 shadow-inner border border-primary/20">
            <Sliders className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Customize your ToolsHub experience</p>
          </div>
        </div>
      </div>

      {/* ── APPEARANCE ── */}
      <SectionLabel label="Appearance" icon={Sun} />
      <Card>
        <div className="px-5 py-5">
          <p className="text-sm font-semibold text-foreground mb-4">Theme</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "light" as const, icon: Sun,  label: "Light", desc: "Clean & bright" },
              { value: "dark"  as const, icon: Moon, label: "Dark",  desc: "Easy on eyes" },
            ]).map(({ value, icon: Icon, label, desc }) => {
              const active = settings.theme === value;
              return (
                <button
                  key={value}
                  onClick={() => update({ theme: value })}
                  className={`relative flex items-center gap-3.5 px-4 py-4 rounded-2xl border-2 transition-all duration-200 text-left group ${
                    active
                      ? "border-primary bg-primary/8 shadow-md shadow-primary/10"
                      : "border-border bg-background hover:border-primary/30 hover:bg-accent/50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground group-hover:text-foreground"
                  }`}>
                    <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold transition-colors ${active ? "text-primary" : "text-foreground"}`}>{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  {active && (
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── TOOL DEFAULTS ── */}
      <SectionLabel label="Tool Defaults" icon={Sliders} />
      <Card>
        {/* Image quality */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-3.5">
            <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Image Compression Quality</p>
                <span className="text-sm font-extrabold text-primary tabular-nums bg-primary/10 px-2 py-0.5 rounded-lg">{localQuality}%</span>
              </div>
              <Slider
                value={[localQuality]}
                onValueChange={([v]) => setLocalQuality(v)}
                onValueCommit={([v]) => update({ imageQuality: v })}
                min={30} max={100} step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">Smaller file</span>
                <span className="text-[10px] text-muted-foreground">Best quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* PDF level */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-3.5">
            <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-3">PDF Compression Level</p>
              <div className="grid grid-cols-3 gap-2">
                {(["lossless", "balanced", "small"] as const).map((l) => {
                  const labels = { lossless: "High Quality", balanced: "Balanced", small: "Smallest" };
                  const active = settings.pdfCompressLevel === l;
                  return (
                    <button
                      key={l}
                      onClick={() => update({ pdfCompressLevel: l })}
                      className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-150 ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
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
        <Row>
          <RowLabel
            icon={Download}
            color="bg-violet-500/10 text-violet-500"
            label="Auto Download"
            sub="Files download automatically after processing"
          />
          <Toggle checked={settings.autoDownload} onChange={(v) => update({ autoDownload: v })} />
        </Row>

        {/* Privacy tips */}
        <Row>
          <RowLabel
            icon={settings.showPrivacyTips ? Eye : EyeOff}
            color="bg-teal-500/10 text-teal-500"
            label="Privacy tips in tools"
            sub='Show "browser only" reminders inside tools'
          />
          <Toggle checked={settings.showPrivacyTips} onChange={(v) => update({ showPrivacyTips: v })} />
        </Row>
      </Card>

      {/* ── PRIVACY ── */}
      <SectionLabel label="Privacy & Security" icon={ShieldCheck} />
      <Card>
        <div className="px-5 py-5 flex items-start gap-4">
          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 mt-0.5">
            <ShieldCheck className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Your files never leave your device</p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              All processing happens 100% in your browser. No files are uploaded to any server. No account required. No tracking. Completely free — forever.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["No uploads", "No account", "No tracking", "100% free"].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── RESET & CLEAR ── */}
      <SectionLabel label="Reset & Clear" icon={RotateCcw} />
      <Card>
        <Row>
          <RowLabel
            icon={RotateCcw}
            color="bg-amber-500/10 text-amber-500"
            label="Reset to Defaults"
            sub="Restore all settings to original values"
          />
          {resetConfirm ? (
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="destructive" onClick={handleResetSettings} className="text-xs h-8 px-3 rounded-xl">Confirm</Button>
              <Button size="sm" variant="ghost" onClick={() => setResetConfirm(false)} className="text-xs h-8 px-3 rounded-xl">Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setResetConfirm(true)} className="text-xs h-8 px-3 shrink-0 rounded-xl border-border">Reset</Button>
          )}
        </Row>
        <Row>
          <RowLabel
            icon={Trash2}
            color="bg-destructive/10 text-destructive"
            label="Clear All Data"
            sub="Deletes all settings and usage stats"
          />
          {clearConfirm ? (
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="destructive" onClick={handleClearAll} className="text-xs h-8 px-3 rounded-xl">Yes, clear</Button>
              <Button size="sm" variant="ghost" onClick={() => setClearConfirm(false)} className="text-xs h-8 px-3 rounded-xl">Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setClearConfirm(true)} className="text-xs h-8 px-3 shrink-0 rounded-xl">Clear</Button>
          )}
        </Row>
      </Card>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-foreground text-background text-sm px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-3 whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
