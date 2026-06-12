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

  // Inject required chars at random positions
  required.forEach((ch, i) => {
    const pos = i % length;
    chars[pos] = ch;
  });

  // Shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

function getStrength(pw: string): { label: string; color: string; width: string; score: number } {
  if (!pw) return { label: "", color: "bg-muted", width: "0%", score: 0 };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { label: "Weak",   color: "bg-red-500",    width: "25%",  score };
  if (score <= 4) return { label: "Fair",   color: "bg-yellow-500", width: "50%",  score };
  if (score <= 5) return { label: "Good",   color: "bg-blue-500",   width: "75%",  score };
  return               { label: "Strong", color: "bg-green-500",  width: "100%", score };
}

export default function PasswordGenerator() {
  useSEO({
    title: "Free Password Generator — Strong & Secure | ToolsHub",
    description: "Generate strong, random passwords instantly. Choose length, symbols, numbers. 100% in your browser — nothing sent to any server.",
  });

  const { count, increment } = useToolCounter("password-generator");

  const [length,  setLength]  = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");
  const [copied,   setCopied]   = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const generate = useCallback(() => {
    const pw = generatePassword(length, opts);
    setPassword(pw);
    setCopied(false);
    if (pw) increment();
  }, [length, opts, increment]);

  useEffect(() => { generate(); }, []);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = getStrength(password);
  const activeOpts = Object.values(opts).filter(Boolean).length;

  const toggle = (key: keyof typeof opts) => {
    if (opts[key] && activeOpts === 1) return;
    setOpts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => { generate(); }, [length, opts]);

  const optList: { key: keyof typeof opts; label: string; example: string }[] = [
    { key: "upper",   label: "Uppercase",   example: "A–Z" },
    { key: "lower",   label: "Lowercase",   example: "a–z" },
    { key: "numbers", label: "Numbers",     example: "0–9" },
    { key: "symbols", label: "Symbols",     example: "!@#$" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Key className="w-3.5 h-3.5" />
              <span>Security Tools</span>
              <UsageCount count={count} label="generated" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Password Generator</h1>
            <p className="text-muted-foreground mt-2">
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
            label="Share this tool"
          />
        </div>
      </div>

      <div className="space-y-5">
        {/* Password display */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <p className="flex-1 font-mono text-lg tracking-widest break-all text-foreground select-all min-h-[1.75rem]">
              {password || <span className="text-muted-foreground text-sm">Select options below…</span>}
            </p>
            <div className="flex gap-2 shrink-0">
              <Button size="icon" variant="ghost" onClick={generate} title="Regenerate">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="icon" variant={copied ? "default" : "outline"} onClick={copy} title="Copy">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Strength bar */}
          {password && (
            <div className="mt-3 space-y-1">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Strength: <strong className="text-foreground ml-0.5">{strength.label}</strong>
                </span>
                <span>{password.length} characters</span>
              </div>
            </div>
          )}
        </div>

        {/* Length slider */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Length</span>
            <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">{length}</span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>6</span>
            <span>64</span>
          </div>
        </div>

        {/* Character options */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Include</p>
          <div className="grid grid-cols-2 gap-3">
            {optList.map(({ key, label, example }) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all ${
                  opts[key]
                    ? "border-primary bg-primary/8 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs font-mono opacity-60">{example}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button className="w-full" size="lg" onClick={generate}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate New Password
        </Button>

        {/* Privacy note */}
        <p className="text-center text-xs text-muted-foreground">
          🔒 Uses <code className="bg-muted px-1 rounded">crypto.getRandomValues()</code> — cryptographically secure. Nothing leaves your browser.
        </p>
      </div>
    </div>
  );
}
