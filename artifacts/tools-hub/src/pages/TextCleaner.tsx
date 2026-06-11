import { useState, useMemo, useEffect, useRef } from "react";
import { AlignLeft, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useShareURL } from "@/hooks/useShareURL";
import { useToolCounter } from "@/hooks/useToolCounter";

interface Option {
  id: string;
  label: string;
  description: string;
}

const OPTIONS: Option[] = [
  { id: "spaces", label: "Remove extra spaces", description: "Trim and collapse multiple spaces" },
  { id: "linebreaks", label: "Fix line breaks", description: "Normalize to single newlines" },
  { id: "uppercase", label: "UPPERCASE", description: "Convert all text to uppercase" },
  { id: "lowercase", label: "lowercase", description: "Convert all text to lowercase" },
  { id: "emojis", label: "Remove emojis", description: "Strip emoji characters" },
];

function applyTransforms(text: string, enabled: Set<string>): string {
  let result = text;

  if (enabled.has("spaces")) {
    result = result
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .join("\n");
  }

  if (enabled.has("linebreaks")) {
    result = result
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  if (enabled.has("emojis")) {
    // eslint-disable-next-line no-misleading-character-class
    result = result.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20D0}-\u{20FF}\u{1F1E0}-\u{1F1FF}]/gu,
      ""
    );
  }

  if (enabled.has("uppercase")) {
    result = result.toUpperCase();
  } else if (enabled.has("lowercase")) {
    result = result.toLowerCase();
  }

  return result;
}

function parseOpts(raw: string): Set<string> {
  if (!raw) return new Set(["spaces", "linebreaks"]);
  return new Set(raw.split(",").filter(Boolean));
}

export default function TextCleaner() {
  useSEO({
    title: "Free Text Cleaner & Formatter — Clean Messy Text Online | ToolsHub",
    description:
      "Clean and format messy text online. Remove extra spaces, fix line breaks, change case, and strip emojis. Free, instant, no signup.",
  });

  const { initialValues, updateParams, copyShareLink, copied: linkCopied } = useShareURL({
    text: "",
    opts: "spaces,linebreaks",
  });

  const { count, increment } = useToolCounter("text-cleaner");

  const [input, setInput] = useState(initialValues.text);
  const [enabled, setEnabled] = useState<Set<string>>(parseOpts(initialValues.opts));
  const [copied, setCopied] = useState(false);

  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      updateParams({ text: input, opts: Array.from(enabled).join(",") });
    }, 500);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [input, enabled, updateParams]);

  const toggle = (id: string) => {
    const next = new Set(enabled);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (id === "uppercase") next.delete("lowercase");
      if (id === "lowercase") next.delete("uppercase");
      next.add(id);
    }
    setEnabled(next);
  };

  const output = useMemo(() => applyTransforms(input, enabled), [input, enabled]);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    increment(); // count each copy
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned-text.txt";
    a.click();
    URL.revokeObjectURL(url);
    increment(); // count each download
  };

  const charDiff = input.length - output.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Text Tools</span>
              <UsageCount count={count} label="clean" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Text Cleaner</h1>
            <p className="text-muted-foreground mt-2">
              Paste messy text, pick your transforms, copy the cleaned result.
            </p>
          </div>
          <ShareButton onCopy={copyShareLink} copied={linkCopied} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            data-testid={`toggle-option-${opt.id}`}
            title={opt.description}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              enabled.has(opt.id)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Input</label>
            <span className="text-xs text-muted-foreground">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your messy text here..."
            data-testid="input-text-raw"
            className="flex-1 min-h-[320px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Output</label>
            <div className="flex items-center gap-3">
              {charDiff > 0 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400" data-testid="text-char-diff">
                  -{charDiff} chars
                </span>
              )}
              <span className="text-xs text-muted-foreground">{output.length} chars</span>
            </div>
          </div>
          <div
            data-testid="output-text-cleaned"
            className="flex-1 min-h-[320px] w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-mono leading-relaxed whitespace-pre-wrap overflow-auto text-foreground"
          >
            {output || <span className="text-muted-foreground">Cleaned text will appear here</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button
          onClick={copy}
          disabled={!output}
          data-testid="button-copy-cleaned"
          variant="outline"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy result
            </>
          )}
        </Button>
        <Button
          onClick={download}
          disabled={!output}
          data-testid="button-download-text"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Download .txt
        </Button>
        <Button
          variant="ghost"
          onClick={() => setInput("")}
          disabled={!input}
          data-testid="button-clear-text"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
