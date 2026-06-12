import { useState, useCallback } from "react";
import { Copy, Check, Minimize2, Maximize2, Trash2, Braces, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

const SAMPLE = `{"user":{"name":"Ali","age":25,"city":"Karachi"},"tools":["compress","convert","crop"],"status":"active","premium":false}`;

type Status = "idle" | "ok" | "error";

export default function JsonFormatter() {
  useSEO({
    title: "Free JSON Formatter & Validator — Beautify & Minify Online | ToolsHub",
    description: "Beautify, minify, and validate JSON instantly in your browser. No ads, no upload, 100% private.",
  });

  const { count, increment } = useToolCounter("json-formatter");

  const [input,      setInput]      = useState("");
  const [output,     setOutput]     = useState("");
  const [status,     setStatus]     = useState<Status>("idle");
  const [errorMsg,   setErrorMsg]   = useState("");
  const [indent,     setIndent]     = useState(2);
  const [copied,     setCopied]     = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const parse = (raw: string): { ok: boolean; val?: unknown; err?: string } => {
    try {
      return { ok: true, val: JSON.parse(raw) };
    } catch (e: unknown) {
      return { ok: false, err: e instanceof Error ? e.message : String(e) };
    }
  };

  const beautify = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const { ok, val, err } = parse(trimmed);
    if (!ok) { setStatus("error"); setErrorMsg(err ?? "Invalid JSON"); setOutput(""); return; }
    setOutput(JSON.stringify(val, null, indent));
    setStatus("ok");
    setErrorMsg("");
    setCopied(false);
    increment();
  }, [input, indent, increment]);

  const minify = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const { ok, val, err } = parse(trimmed);
    if (!ok) { setStatus("error"); setErrorMsg(err ?? "Invalid JSON"); setOutput(""); return; }
    setOutput(JSON.stringify(val));
    setStatus("ok");
    setErrorMsg("");
    setCopied(false);
    increment();
  }, [input, increment]);

  const validate = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const { ok, err } = parse(trimmed);
    setStatus(ok ? "ok" : "error");
    setErrorMsg(ok ? "" : (err ?? "Invalid JSON"));
    if (ok) setOutput(output || "");
  }, [input, output]);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setInput(SAMPLE);
    setOutput("");
    setStatus("idle");
    setErrorMsg("");
    setCopied(false);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setStatus("idle");
    setErrorMsg("");
    setCopied(false);
  };

  const lineCount = output.split("\n").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Braces className="w-3.5 h-3.5" />
              <span>Developer Tools</span>
              <UsageCount count={count} label="formatted" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">JSON Formatter</h1>
            <p className="text-muted-foreground mt-2">
              Beautify, minify, and validate JSON. 100% in your browser — your data never leaves.
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

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button onClick={beautify} disabled={!input.trim()}>
          <Maximize2 className="w-4 h-4 mr-2" />
          Beautify
        </Button>
        <Button variant="secondary" onClick={minify} disabled={!input.trim()}>
          <Minimize2 className="w-4 h-4 mr-2" />
          Minify
        </Button>
        <Button variant="outline" onClick={validate} disabled={!input.trim()}>
          Validate
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Indent:</span>
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                indent === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={loadSample}
            className="px-3 py-1 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
          >
            Sample
          </button>
          <button
            onClick={clear}
            className="px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status badge */}
      {status === "ok" && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-3 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Valid JSON
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-mono">{errorMsg}</span>
        </div>
      )}

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Input</span>
            <span className="text-xs text-muted-foreground">{input.length > 0 ? `${input.length} chars` : "Paste JSON here"}</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setStatus("idle"); setErrorMsg(""); }}
            placeholder='Paste your JSON here…\n\nExample:\n{"name": "Ali", "age": 25}'
            spellCheck={false}
            className="w-full h-80 rounded-xl border border-border bg-card text-foreground text-sm font-mono p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50 transition-colors"
          />
        </div>

        {/* Output */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Output</span>
            <div className="flex items-center gap-2">
              {output && (
                <span className="text-xs text-muted-foreground">{lineCount} lines</span>
              )}
              {output && (
                <button
                  onClick={copy}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted output will appear here…"
            spellCheck={false}
            className="w-full h-80 rounded-xl border border-border bg-muted/40 text-foreground text-sm font-mono p-4 resize-none focus:outline-none placeholder:text-muted-foreground/50 cursor-default"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: "✨", title: "Beautify", desc: "Adds indentation and line breaks — makes JSON human-readable" },
          { icon: "📦", title: "Minify",   desc: "Removes all whitespace — smaller size for APIs and storage" },
          { icon: "✅", title: "Validate", desc: "Checks if your JSON is valid — shows exact error location" },
        ].map((tip) => (
          <div key={tip.title} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground mb-1">{tip.icon} {tip.title}</p>
            <p className="text-xs text-muted-foreground">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
