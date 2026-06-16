import { useState, useCallback, useMemo, useRef } from "react";
import { Braces, ChevronRight, ChevronDown, Upload, Copy, Check, Trash2, AlertCircle, Search, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue }
type JsonArray = JsonValue[];

interface JsonStats {
  keys: number;
  depth: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
}

function analyzeJson(val: JsonValue, depth = 0): JsonStats {
  const stats: JsonStats = { keys: 0, depth, arrays: 0, objects: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 };
  if (val === null) { stats.nulls = 1; return stats; }
  if (typeof val === "string") { stats.strings = 1; return stats; }
  if (typeof val === "number") { stats.numbers = 1; return stats; }
  if (typeof val === "boolean") { stats.booleans = 1; return stats; }
  if (Array.isArray(val)) {
    stats.arrays = 1;
    for (const item of val) {
      const s = analyzeJson(item, depth + 1);
      stats.keys += s.keys; stats.depth = Math.max(stats.depth, s.depth);
      stats.arrays += s.arrays; stats.objects += s.objects;
      stats.strings += s.strings; stats.numbers += s.numbers;
      stats.booleans += s.booleans; stats.nulls += s.nulls;
    }
    return stats;
  }
  if (typeof val === "object") {
    stats.objects = 1;
    for (const [, v] of Object.entries(val as JsonObject)) {
      stats.keys++;
      const s = analyzeJson(v, depth + 1);
      stats.keys += s.keys; stats.depth = Math.max(stats.depth, s.depth);
      stats.arrays += s.arrays; stats.objects += s.objects;
      stats.strings += s.strings; stats.numbers += s.numbers;
      stats.booleans += s.booleans; stats.nulls += s.nulls;
    }
    return stats;
  }
  return stats;
}

function typeColor(val: JsonValue): string {
  if (val === null) return "text-slate-400";
  if (typeof val === "string") return "text-emerald-600 dark:text-emerald-400";
  if (typeof val === "number") return "text-blue-600 dark:text-blue-400";
  if (typeof val === "boolean") return "text-violet-600 dark:text-violet-400";
  if (Array.isArray(val)) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function typeLabel(val: JsonValue): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return `array[${val.length}]`;
  return typeof val;
}

function JsonNode({ k, val, depth = 0, defaultOpen = true }: { k?: string; val: JsonValue; depth?: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen && depth < 2);
  const isObj = typeof val === "object" && val !== null && !Array.isArray(val);
  const isArr = Array.isArray(val);
  const isExpandable = isObj || isArr;
  const entries = isObj ? Object.entries(val as JsonObject) : isArr ? val.map((v, i) => [String(i), v] as [string, JsonValue]) : [];

  return (
    <div className="font-mono text-[12px] leading-relaxed pl-4 border-l border-border/30">
      <div
        className={`flex items-start gap-1 group py-0.5 rounded hover:bg-muted/30 px-1 -ml-1 ${isExpandable ? "cursor-pointer" : ""}`}
        onClick={() => isExpandable && setOpen(o => !o)}
      >
        {isExpandable ? (
          open ? <ChevronDown className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
        ) : <span className="w-3 flex-shrink-0" />}

        {k !== undefined && (
          <span className="text-foreground font-semibold mr-1">"{k}"<span className="text-muted-foreground font-normal">:</span></span>
        )}

        {isExpandable ? (
          <span className={typeColor(val)}>
            {isArr ? `[` : `{`}
            {!open && <span className="text-muted-foreground">{isArr ? `${(val as JsonArray).length} items` : `${Object.keys(val as JsonObject).length} keys`}</span>}
            {!open && (isArr ? "]" : "}")}
          </span>
        ) : (
          <span className={typeColor(val)}>
            {val === null ? "null" : typeof val === "string" ? `"${val}"` : String(val)}
          </span>
        )}
      </div>

      {isExpandable && open && (
        <>
          <div>
            {entries.map(([ek, ev]) => <JsonNode key={ek} k={ek} val={ev} depth={depth + 1} defaultOpen={depth < 1} />)}
          </div>
          <div className="pl-4 py-0.5 text-muted-foreground">{isArr ? "]" : "}"}</div>
        </>
      )}
    </div>
  );
}

function getArrayTable(val: JsonValue): { headers: string[]; rows: string[][] } | null {
  if (!Array.isArray(val) || val.length === 0) return null;
  const firstObj = val[0];
  if (typeof firstObj !== "object" || firstObj === null || Array.isArray(firstObj)) return null;
  const headers = Object.keys(firstObj as JsonObject);
  const rows = val.map(item => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return headers.map(() => "");
    return headers.map(h => {
      const v = (item as JsonObject)[h];
      if (v === null) return "null";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    });
  });
  return { headers, rows };
}

const SAMPLE_JSON = JSON.stringify({
  name: "ToolsHub",
  version: "2.0",
  tools: [
    { id: "csv-explorer", category: "utility", rating: 4.9 },
    { id: "bmi-calculator", category: "utility", rating: 4.8 },
    { id: "json-explorer", category: "utility", rating: 5.0 },
  ],
  meta: { private: true, serverUploads: false, builtWith: "React + Vite" },
}, null, 2);

export default function JsonExplorer() {
  useSEO({
    title: "JSON Explorer — Visualize, Validate & Format JSON | ToolsHub",
    description: "Paste or upload a JSON file and explore it with a collapsible tree, stats panel, and array table view. 100% private, runs in your browser.",
  });

  const { count, increment } = useToolCounter("json-explorer");
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<JsonValue | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"tree" | "table" | "format">("tree");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [arraySel, setArraySel] = useState<string>("root");
  const fileRef = useRef<HTMLInputElement>(null);

  function parse(text: string) {
    if (!text.trim()) { setParsed(null); setError(""); return; }
    try {
      const p = JSON.parse(text);
      setParsed(p);
      setError("");
      setTab("tree");
      increment();
    } catch (e) {
      setError((e as Error).message);
      setParsed(null);
    }
  }

  const stats = useMemo(() => parsed !== null ? analyzeJson(parsed) : null, [parsed]);

  const formattedJson = useMemo(() => parsed !== null ? JSON.stringify(parsed, null, 2) : "", [parsed]);

  const tableData = useMemo(() => {
    if (!parsed) return null;
    if (arraySel === "root") return getArrayTable(parsed);
    try {
      const parts = arraySel.split(".");
      let cur: JsonValue = parsed;
      for (const p of parts) { cur = (cur as JsonObject)[p] as JsonValue; }
      return getArrayTable(cur);
    } catch { return null; }
  }, [parsed, arraySel]);

  const arrayPaths = useMemo(() => {
    const paths: string[] = [];
    if (!parsed) return paths;
    if (Array.isArray(parsed)) paths.push("root");
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed as JsonObject)) {
        if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object") paths.push(k);
      }
    }
    return paths;
  }, [parsed]);

  const filteredNodes = useMemo(() => {
    if (!search.trim() || !formattedJson) return null;
    const q = search.toLowerCase();
    return formattedJson.split("\n").filter(l => l.toLowerCase().includes(q));
  }, [search, formattedJson]);

  async function handleCopy() {
    await navigator.clipboard.writeText(formattedJson);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const t = ev.target?.result as string; setRaw(t); parse(t); };
    reader.readAsText(file);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-5 pb-10">
      <div className="mb-8 flex flex-col items-center text-center gap-3">
        <div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <Braces className="w-3.5 h-3.5" />
            <span>Utility Tools</span>
            <UsageCount count={count} label="explored" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">JSON Explorer</h1>
          <p className="text-muted-foreground mt-2">Paste or upload any JSON — collapsible tree view, key stats, array table. Zero uploads, 100% private.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={raw}
              onChange={e => { setRaw(e.target.value); parse(e.target.value); }}
              placeholder={`Paste JSON here…\n\nOr try the sample →`}
              className="w-full min-h-[180px] rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              spellCheck={false}
            />
            {error && (
              <div className="mt-2 flex items-start gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span className="font-mono">{error}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { fileRef.current?.click(); }} className="gap-1.5 text-xs">
              <Upload className="w-3.5 h-3.5" /> Upload .json
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={onFileChange} />
            <Button size="sm" variant="outline" onClick={() => { setRaw(SAMPLE_JSON); parse(SAMPLE_JSON); }} className="text-xs">Try sample</Button>
            <Button size="sm" variant="ghost" onClick={() => { setRaw(""); setParsed(null); setError(""); }} disabled={!raw} className="text-xs gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </Button>
          </div>

          {parsed !== null && (
            <>
              <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit">
                {(["tree", "table", "format"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {t === "tree" ? "🌲 Tree" : t === "table" ? "📊 Table" : "{ } Format"}
                  </button>
                ))}
              </div>

              {tab === "tree" && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keys or values…"
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 overflow-auto max-h-[60vh]">
                    {search.trim() ? (
                      filteredNodes && filteredNodes.length > 0 ? (
                        <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">
                          {filteredNodes.map((line, i) => {
                            const q = search.toLowerCase();
                            const idx = line.toLowerCase().indexOf(q);
                            if (idx === -1) return <div key={i}>{line}</div>;
                            return (
                              <div key={i}>
                                {line.slice(0, idx)}
                                <mark className="bg-yellow-300/40 text-foreground rounded px-0.5">{line.slice(idx, idx + search.length)}</mark>
                                {line.slice(idx + search.length)}
                              </div>
                            );
                          })}
                        </pre>
                      ) : <p className="text-sm text-muted-foreground">No matches for "{search}"</p>
                    ) : (
                      <JsonNode val={parsed} />
                    )}
                  </div>
                </div>
              )}

              {tab === "table" && (
                <div className="space-y-3">
                  {arrayPaths.length > 1 && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Array:</label>
                      <select value={arraySel} onChange={e => setArraySel(e.target.value)}
                        className="text-sm rounded-lg border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring">
                        {arrayPaths.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  )}
                  {tableData ? (
                    <div className="rounded-xl border border-border overflow-auto max-h-[60vh]">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                          <tr>
                            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground border-b border-border w-10">#</th>
                            {tableData.headers.map(h => <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground border-b border-border whitespace-nowrap">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-border/50 hover:bg-muted/20">
                              <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">{ri + 1}</td>
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-2 text-xs max-w-[160px] truncate text-foreground" title={cell}>
                                  {cell === "null" ? <span className="text-muted-foreground/50 italic">null</span> : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                      <FileSpreadsheet className="w-8 h-8 opacity-30" />
                      <p className="text-sm">No array of objects found at root. Table view works best with an array of uniform objects.</p>
                    </div>
                  )}
                </div>
              )}

              {tab === "format" && (
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs">
                      {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy formatted</>}
                    </Button>
                  </div>
                  <pre className="bg-card border border-border rounded-xl p-4 text-xs font-mono overflow-auto max-h-[60vh] text-foreground leading-relaxed whitespace-pre">
                    {formattedJson}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-3">
          {stats ? (
            <>
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Structure</p>
                {[
                  { label: "Total keys", value: stats.keys },
                  { label: "Max depth", value: stats.depth },
                  { label: "Objects", value: stats.objects },
                  { label: "Arrays", value: stats.arrays },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-bold text-foreground tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Value Types</p>
                {[
                  { label: "Strings",  value: stats.strings,  color: "bg-emerald-500" },
                  { label: "Numbers",  value: stats.numbers,  color: "bg-blue-500" },
                  { label: "Booleans", value: stats.booleans, color: "bg-violet-500" },
                  { label: "Nulls",    value: stats.nulls,    color: "bg-slate-400" },
                ].map(({ label, value, color }) => {
                  const total = stats.strings + stats.numbers + stats.booleans + stats.nulls;
                  const pct = total ? (value / total) * 100 : 0;
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-foreground tabular-nums">{value}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Raw size</p>
                <p className="text-lg font-bold text-foreground tabular-nums mt-0.5">{(new TextEncoder().encode(raw).byteLength / 1024).toFixed(2)} KB</p>
                <p className="text-xs text-muted-foreground mt-1">Formatted: {(new TextEncoder().encode(formattedJson).byteLength / 1024).toFixed(2)} KB</p>
              </div>
            </>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 text-center space-y-2">
              <Braces className="w-8 h-8 text-muted-foreground/30 mx-auto" />
              <p className="text-xs text-muted-foreground">Paste JSON to see stats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
