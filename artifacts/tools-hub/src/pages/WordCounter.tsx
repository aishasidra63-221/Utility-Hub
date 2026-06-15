import { useState, useMemo, useRef, useCallback } from "react";
import { BookOpen, Copy, Check, Trash2, Clock, Mic, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","might","shall","can","need",
  "i","you","he","she","it","we","they","me","him","her","us","them",
  "my","your","his","its","our","their","this","that","these","those",
  "not","no","nor","so","yet","both","either","neither","whether",
  "as","if","then","than","when","while","because","since","after","before",
  "from","by","about","into","through","during","above","below","up","down",
  "out","off","over","under","again","further","once","here","there","where",
  "what","which","who","how","all","each","every","more","most","other",
  "some","such","own","same","few","just","s","t","re","ve","ll","d","m",
]);

function formatTime(totalSeconds: number): string {
  if (totalSeconds === 0) return "0 sec";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes === 0) return `${seconds} sec`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}

function computeStats(text: string) {
  if (text.trim() === "") {
    return {
      words: 0, chars: text.length, charsNoSpaces: 0,
      sentences: 0, paragraphs: 0, readingTime: 0, speakingTime: 0,
    };
  }
  const wordList = text.trim().split(/\s+/);
  const words = wordList.filter(Boolean).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = (text.match(/[^.!?]*[.!?]+/g) ?? []).filter(s => s.trim().length > 1).length || (text.trim() ? 1 : 0);
  const paragraphs = text.split(/\n\s*\n+/).filter(p => p.trim().length > 0).length;
  const readingTime = (words / 200) * 60;
  const speakingTime = (words / 130) * 60;
  return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime, speakingTime };
}

function computeKeywords(text: string): Array<{ word: string; count: number; pct: number }> {
  if (text.trim() === "") return [];
  const wordList = text.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
  const total = wordList.length;
  if (total === 0) return [];
  const freq: Record<string, number> = {};
  for (const w of wordList) {
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] ?? 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count, pct: Math.round((count / total) * 1000) / 10 }));
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
}

function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-0.5 min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums leading-tight">
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function WordCounter() {
  useSEO({
    title: "Word Counter & Text Analyzer — Count Words, Characters & Reading Time | ToolsHub",
    description:
      "Count words, characters, sentences and reading time instantly. Fast, private and browser-based.",
  });

  const { count, increment } = useToolCounter("word-counter");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => computeStats(text), [text]);
  const keywords = useMemo(() => computeKeywords(text), [text]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    increment();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
    textareaRef.current?.focus();
  };

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Utility Tools</span>
              <UsageCount count={count} label="analyzed" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Word Counter & Text Analyzer</h1>
            <p className="text-muted-foreground mt-2">
              Count words, characters, sentences and reading time instantly. Fast, private and browser-based.
            </p>
          </div>
          <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Words" value={stats.words.toLocaleString()} />
        <StatCard label="Characters" value={stats.chars.toLocaleString()} />
        <StatCard label="No Spaces" value={stats.charsNoSpaces.toLocaleString()} sub="characters" />
        <StatCard label="Sentences" value={stats.sentences.toLocaleString()} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
        <StatCard
          label="Reading Time"
          value={formatTime(stats.readingTime)}
          sub="at 200 wpm"
          icon={<Clock className="w-3 h-3" />}
        />
        <StatCard
          label="Speaking Time"
          value={formatTime(stats.speakingTime)}
          sub="at 130 wpm"
          icon={<Mic className="w-3 h-3" />}
        />
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            No hard limits
          </div>
          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 leading-tight mt-1">
            Handles 100k+
          </div>
          <div className="text-xs text-muted-foreground">words smoothly</div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your Text
          </label>
          <span className="text-xs text-muted-foreground">{stats.words.toLocaleString()} words</span>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Paste or type your text here — stats update instantly as you type…"
          className="w-full min-h-[300px] sm:min-h-[380px] rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono leading-relaxed"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={handleCopy} disabled={!text} variant="outline" className="gap-2">
          {copied
            ? <><Check className="w-4 h-4 text-emerald-500" />Copied</>
            : <><Copy className="w-4 h-4" />Copy text</>
          }
        </Button>
        <Button onClick={handleClear} disabled={!text} variant="ghost" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      {keywords.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Keyword Density</h2>
            <span className="text-xs text-muted-foreground">(top 10, excluding common words)</span>
          </div>
          <div className="space-y-2.5">
            {keywords.map(({ word, count: kCount, pct }) => (
              <div key={word} className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground w-28 truncate capitalize">{word}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(pct * 5, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right tabular-nums">
                  {kCount}× ({pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
