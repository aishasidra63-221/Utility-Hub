import { useState, useCallback, useEffect } from "react";
import { Copy, Check, RefreshCw, Key, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

const CHARS = {
  upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower:   "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(
  length: number,
  opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean },
): string {
  let pool = "";
  const required: string[] = [];

  if (opts.upper)   { pool += CHARS.upper;   required.push(CHARS.upper[Math.floor(Math.random() * CHARS.upper.length)]); }
  if (opts.lower)   { pool += CHARS.lower;   required.push(CHARS.lower[Math.floor(Math.random() * CHARS.lower.length)]); }
  if (opts.numbers) { pool += CHARS.numbers; required.push(CHARS.numbers[Math.floor(Math.random() * CHARS.numbers.length)]); }
  if (opts.symbols) { pool += CHARS.symbols; required.push(CHARS.symbols[Math.floor(Math.random() * CHARS.symbols.length)]); }

  if (!pool) return "";

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  const chars = Array.from(arr).map((n) => pool[n % pool.length]);

  required.forEach((ch, i) => {
    chars[i % length] = ch;
  });

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

function getStrength(pw: string) {
  if (!pw) return { label: "", color: "bg-muted", width: "0%", textColor: "" };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 2) return { label: "Weak",   color: "bg-red-500",    width: "25%",  textColor: "text-red-500"   };
  if (s <= 4) return { label: "Fair",   color: "bg-yellow-500", width: "50%",  textColor: "text-yellow-500"};
  if (s <= 5) return { label: "Good",   color: "bg-blue-500",   width: "75%",  textColor: "text-blue-500"  };
  return             { label: "Strong", color: "bg-green-500",  width: "100%", textColor: "text-green-500" };
}

export default function PasswordGenerator() {
  useSEO({
    title: "Free Password Generator — Strong & Secure | ToolsHub",
    description: "Generate strong, random passwords instantly. Choose length, symbols, numbers. 100% in your browser — nothing sent to any server.",
  });

  const { count, increment } = useToolCounter("password-generator");

  const [length,     setLength]     = useState(16);
  const [opts,       setOpts]       = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password,   setPassword]   = useState("");
  const [copied,     setCopied]     = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Generate without incrementing (auto on settings change)
  const generate = useCallback(() => {
    const pw = generatePassword(length, opts);
    setPassword(pw);
    setCopied(false);
    return pw;
  }, [length, opts]);

  // Manual button press — generate AND count
  const handleGenerate = useCallback(() => {
    const pw = generate();
    if (pw) increment();
  }, [generate, increment]);

  // Auto-generate when length/opts change (no counting)
  useEffect(() => { generate(); }, [generate]);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggle = (key: keyof typeof opts) => {
    const active = Object.values(opts).filter(Boolean).length;
    if (opts[key] && active === 1) return;
    setOpts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const strength = getStrength(password);

  const optList: { key: keyof typeof opts; label: string; example: string; desc: string }[] = [
    { key: "upper",   label: "Uppercase",  example: "A – Z",  desc: "Capital letters"    },
    { key: "lower",   label: "Lowercase",  example: "a – z",  desc: "Small letters"      },
    { key: "numbers", label: "Numbers",    example: "0 – 9",  desc: "Digits"             },
    { key: "symbols", label: "Symbols",    example: "!@#$",   desc: "Special characters" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Key className="w-3.5 h-3.5" />
            <span>Security Tools</span>
            <UsageCount count={count} label="generated" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Password Generator</h1>
          <p className="text-muted-foreground mt-2 text-base">
            Strong, random passwords instantly. 100% in your browser — nothing leaves your device.
          </p>
        </div>
        <ShareButton
          onCopy={async () => {
            await navigator.clipboard.writeText(window.location.href);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2500);
          }}
          copied={linkCopied}
          label="Share"
        />
      </div>

      {/* Password display — full width */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Generated Password</p>
        <div className="flex items-center gap-4 flex-wrap">
          <p className="flex-1 font-mono text-2xl font-semibold tracking-widest break-all text-foreground select-all min-h-[2rem]">
            {password || <span className="text-muted-foreground/50 text-lg">—</span>}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Button size="lg" variant="outline" onClick={handleGenerate} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
            <Button size="lg" variant={copied ? "default" : "secondary"} onClick={copy} className="gap-2 min-w-[110px]">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Strength bar */}
        {password && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                Strength:
                <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
              </span>
              <span className="text-muted-foreground font-mono">{password.length} characters</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Length */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground text-base">Password Length</p>
              <p className="text-xs text-muted-foreground mt-0.5">Longer = safer</p>
            </div>
            <span className="text-3xl font-bold font-mono text-primary">{length}</span>
          </div>

          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer h-2"
          />

          <div className="flex justify-between">
            {[8, 12, 16, 24, 32].map((n) => (
              <button
                key={n}
                onClick={() => setLength(n)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                  length === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex justify-between text-xs text-muted-foreground px-0.5">
            <span>6 — Minimum</span>
            <span>64 — Maximum</span>
          </div>
        </div>

        {/* Right — Character types */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="font-semibold text-foreground text-base mb-1">Character Types</p>
          <p className="text-xs text-muted-foreground mb-5">Toggle what to include</p>
          <div className="grid grid-cols-2 gap-4">
            {optList.map(({ key, label, example, desc }) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`flex flex-col items-start px-4 py-4 rounded-xl border text-left transition-all ${
                  opts[key]
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                <span className={`font-mono text-lg font-bold mb-1 ${opts[key] ? "text-primary" : "text-muted-foreground/50"}`}>
                  {example}
                </span>
                <span className={`text-sm font-semibold ${opts[key] ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <Button className="flex-1 sm:flex-none sm:min-w-[220px] h-12 text-base" onClick={handleGenerate}>
          <RefreshCw className="w-5 h-5 mr-2" />
          Generate New Password
        </Button>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          🔒 Uses <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">crypto.getRandomValues()</code> — cryptographically secure
        </p>
      </div>
    </div>
  );
}
