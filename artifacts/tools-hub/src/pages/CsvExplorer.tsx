import { useState, useCallback, useRef, useMemo } from "react";
import {
  TableIcon, BarChart2, Search, Upload, Download, Trash2,
  ChevronUp, ChevronDown, ChevronsUpDown, FileSpreadsheet,
  ArrowUpDown, Hash, Type, Calendar, AlertCircle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from "recharts";

type ColType = "number" | "date" | "text";

interface ColStat {
  name: string;
  type: ColType;
  nullCount: number;
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  topValues: { value: string; count: number }[];
}

type SortDir = "asc" | "desc" | null;

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuote && text[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if ((ch === "\r" || ch === "\n") && !inQuote) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      lines.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur) lines.push(cur);

  function splitRow(line: string): string[] {
    const cells: string[] = [];
    let cell = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cell += '"'; i++; }
        else inQ = !inQ;
      } else if (c === "," && !inQ) {
        cells.push(cell.trim()); cell = "";
      } else { cell += c; }
    }
    cells.push(cell.trim());
    return cells;
  }

  const nonEmpty = lines.filter(l => l.trim());
  if (nonEmpty.length === 0) return { headers: [], rows: [] };
  const headers = splitRow(nonEmpty[0]);
  const rows = nonEmpty.slice(1).map(splitRow);
  return { headers, rows };
}

function detectType(values: string[]): ColType {
  const nonEmpty = values.filter(v => v !== "" && v !== "null" && v !== "NA" && v !== "N/A");
  if (nonEmpty.length === 0) return "text";
  const numericCount = nonEmpty.filter(v => !isNaN(Number(v)) && v !== "").length;
  if (numericCount / nonEmpty.length > 0.85) return "number";
  const dateCount = nonEmpty.filter(v => !isNaN(Date.parse(v))).length;
  if (dateCount / nonEmpty.length > 0.85) return "date";
  return "text";
}

function computeStats(headers: string[], rows: string[][]): ColStat[] {
  return headers.map((name, ci) => {
    const vals = rows.map(r => (r[ci] ?? "").trim());
    const nullCount = vals.filter(v => v === "" || v === "null" || v === "NA" || v === "N/A").length;
    const nonNull = vals.filter(v => v !== "" && v !== "null" && v !== "NA" && v !== "N/A");
    const uniqueCount = new Set(vals).size;
    const type = detectType(vals);

    const freq: Record<string, number> = {};
    for (const v of vals) freq[v] = (freq[v] ?? 0) + 1;
    const topValues = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([value, count]) => ({ value: value || "(empty)", count }));

    if (type === "number") {
      const nums = nonNull.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
      const mean = nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : undefined;
      const mid = Math.floor(nums.length / 2);
      const median = nums.length
        ? nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid]
        : undefined;
      return { name, type, nullCount, uniqueCount, min: nums[0], max: nums[nums.length - 1], mean, median, topValues };
    }

    if (type === "date") {
      const dates = nonNull.map(v => new Date(v).getTime()).filter(n => !isNaN(n)).sort((a, b) => a - b);
      return {
        name, type, nullCount, uniqueCount,
        min: dates.length ? new Date(dates[0]).toLocaleDateString() : undefined,
        max: dates.length ? new Date(dates[dates.length - 1]).toLocaleDateString() : undefined,
        topValues,
      };
    }

    return { name, type, nullCount, uniqueCount, topValues };
  });
}

function fmt(n: number | undefined, decimals = 2): string {
  if (n === undefined) return "—";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

const CHART_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#10b981","#3b82f6","#f43f5e",
];

const PAGE_SIZE = 50;

export default function CsvExplorer() {
  useSEO({
    title: "CSV Explorer — Visualize & Analyze CSV Files Privately | ToolsHub",
    description:
      "Upload a CSV file and explore it instantly — table view, column stats, and charts. 100% private, runs entirely in your browser.",
  });

  const { count, increment } = useToolCounter("csv-explorer");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [tab, setTab] = useState<"table" | "stats" | "charts">("table");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);
  const [chartCol, setChartCol] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => (headers.length ? computeStats(headers, rows) : []), [headers, rows]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => r.some(c => c.toLowerCase().includes(q)));
  }, [rows, search]);

  const sorted = useMemo(() => {
    if (sortCol === null || sortDir === null) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? ""; const bv = b[sortCol] ?? "";
      const an = Number(av); const bn = Number(bv);
      const numCmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv);
      return sortDir === "asc" ? numCmp : -numCmp;
    });
  }, [filtered, sortCol, sortDir]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(ci: number) {
    if (sortCol !== ci) { setSortCol(ci); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else if (sortDir === "desc") { setSortCol(null); setSortDir(null); }
    setPage(0);
  }

  function SortIcon({ ci }: { ci: number }) {
    if (sortCol !== ci) return <ChevronsUpDown className="w-3 h-3 opacity-40 group-hover:opacity-80" />;
    if (sortDir === "asc") return <ChevronUp className="w-3 h-3 text-primary" />;
    return <ChevronDown className="w-3 h-3 text-primary" />;
  }

  function loadFile(file: File) {
    if (!file.name.match(/\.(csv|tsv|txt)$/i)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? "";
      const { headers: h, rows: r } = parseCSV(text);
      if (h.length === 0) return;
      setHeaders(h);
      setRows(r);
      setFileName(file.name);
      setFileSize(file.size);
      setTab("table");
      setSearch(""); setSortCol(null); setSortDir(null); setPage(0); setChartCol(0);
      increment();
    };
    reader.readAsText(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, []);

  function exportCSV() {
    const escape = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n")) ? `"${v.replace(/"/g, '""')}"` : v;
    const csvContent = [headers, ...sorted].map(r => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `filtered_${fileName || "export.csv"}`; a.click();
    URL.revokeObjectURL(url);
  }

  const chartStat = stats[chartCol];
  const chartData = chartStat?.topValues ?? [];

  const hasData = headers.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-5 pb-10">
      <div className="mb-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Utility Tools</span>
              <UsageCount count={count} label="analyzed" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">CSV Explorer</h1>
            <p className="text-muted-foreground mt-2">
              Upload any CSV and instantly explore it — table view, column stats, and charts. Zero uploads, 100% private.
            </p>
          </div>
          <ShareButton
            onCopy={async () => { await navigator.clipboard.writeText(window.location.href); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); }}
            copied={linkCopied}
            label="Share this tool"
          />
        </div>
      </div>

      {!hasData ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all py-20 px-8
            ${dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse — supports .csv, .tsv, .txt</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No upload</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No size limit</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% private</span>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={e => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <FileSpreadsheet className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {rows.length.toLocaleString()} rows · {headers.length} columns · {(fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> Export filtered
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setHeaders([]); setRows([]); setFileName(""); }} className="gap-1.5 text-xs text-muted-foreground">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </Button>
            </div>
          </div>

          <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit">
            {(["table", "stats", "charts"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize
                  ${tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "table" && <TableIcon className="w-3.5 h-3.5" />}
                {t === "stats" && <ArrowUpDown className="w-3.5 h-3.5" />}
                {t === "charts" && <BarChart2 className="w-3.5 h-3.5" />}
                {t}
              </button>
            ))}
          </div>

          {tab === "table" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Search rows…"
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {filtered.length !== rows.length && (
                  <span className="text-xs text-muted-foreground">{filtered.length.toLocaleString()} of {rows.length.toLocaleString()} rows</span>
                )}
              </div>

              <div className="rounded-xl border border-border overflow-auto max-h-[60vh]">
                <table className="w-full text-sm border-collapse min-w-max">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-muted/80 backdrop-blur-sm">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground border-b border-border w-10 select-none">#</th>
                      {headers.map((h, ci) => (
                        <th
                          key={ci}
                          onClick={() => handleSort(ci)}
                          className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground border-b border-border cursor-pointer select-none hover:bg-muted group whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[160px]" title={h}>{h}</span>
                            <SortIcon ci={ci} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row, ri) => (
                      <tr key={ri} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">{page * PAGE_SIZE + ri + 1}</td>
                        {headers.map((_, ci) => (
                          <td key={ci} className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate" title={row[ci]}>
                            {row[ci] === "" || row[ci] === "null" || row[ci] === "NA"
                              ? <span className="text-muted-foreground/50 italic text-xs">null</span>
                              : row[ci]}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {pageRows.length === 0 && (
                      <tr><td colSpan={headers.length + 1} className="text-center text-muted-foreground py-12 text-sm">No rows match your search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pageCount > 1 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Page {page + 1} of {pageCount} ({sorted.length.toLocaleString()} rows)</span>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(0)} className="h-7 px-2 text-xs">«</Button>
                    <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-7 px-2 text-xs">‹</Button>
                    <Button size="sm" variant="outline" disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)} className="h-7 px-2 text-xs">›</Button>
                    <Button size="sm" variant="outline" disabled={page >= pageCount - 1} onClick={() => setPage(pageCount - 1)} className="h-7 px-2 text-xs">»</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "stats" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.name} className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                        ${s.type === "number" ? "bg-emerald-500/15 text-emerald-600" : s.type === "date" ? "bg-blue-500/15 text-blue-600" : "bg-violet-500/15 text-violet-600"}`}>
                        {s.type === "number" ? <Hash className="w-3.5 h-3.5" /> : s.type === "date" ? <Calendar className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate" title={s.name}>{s.name}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0
                      ${s.type === "number" ? "bg-emerald-500/10 text-emerald-600" : s.type === "date" ? "bg-blue-500/10 text-blue-600" : "bg-violet-500/10 text-violet-600"}`}>
                      {s.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Unique</span><span className="font-medium tabular-nums">{s.uniqueCount.toLocaleString()}</span></div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Null</span>
                      <span className={`font-medium tabular-nums ${s.nullCount > 0 ? "text-amber-500" : ""}`}>{s.nullCount.toLocaleString()}</span>
                    </div>
                    {s.type === "number" && <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Min</span><span className="font-medium tabular-nums">{fmt(s.min as number)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Max</span><span className="font-medium tabular-nums">{fmt(s.max as number)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Mean</span><span className="font-medium tabular-nums">{fmt(s.mean)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Median</span><span className="font-medium tabular-nums">{fmt(s.median)}</span></div>
                    </>}
                    {s.type === "date" && <>
                      <div className="flex justify-between col-span-2"><span className="text-muted-foreground">Earliest</span><span className="font-medium">{String(s.min ?? "—")}</span></div>
                      <div className="flex justify-between col-span-2"><span className="text-muted-foreground">Latest</span><span className="font-medium">{String(s.max ?? "—")}</span></div>
                    </>}
                    {s.nullCount === rows.length && (
                      <div className="col-span-2 flex items-center gap-1 text-amber-500">
                        <AlertCircle className="w-3 h-3" /><span>All values are empty</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Top values</p>
                    {s.topValues.slice(0, 4).map(({ value, count: c }) => {
                      const pct = rows.length ? (c / rows.length) * 100 : 0;
                      return (
                        <div key={value} className="flex items-center gap-2">
                          <span className="text-xs text-foreground truncate flex-1 max-w-[100px]" title={value}>{value}</span>
                          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{c}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "charts" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground">Column:</label>
                <select
                  value={chartCol}
                  onChange={e => setChartCol(Number(e.target.value))}
                  className="text-sm rounded-lg border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                </select>
                {chartStat && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                    ${chartStat.type === "number" ? "bg-emerald-500/10 text-emerald-600" : chartStat.type === "date" ? "bg-blue-500/10 text-blue-600" : "bg-violet-500/10 text-violet-600"}`}>
                    {chartStat.type}
                  </span>
                )}
              </div>

              {chartStat && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      {chartStat.type === "number" ? "Value Distribution" : "Top Values"} — <span className="text-primary">{chartStat.name}</span>
                    </h3>
                    <span className="text-xs text-muted-foreground">{chartStat.uniqueCount.toLocaleString()} unique values</span>
                  </div>

                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 60, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                          dataKey="value"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          tickLine={false}
                          axisLine={false}
                          width={40}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "hsl(var(--popover-foreground))",
                          }}
                          cursor={{ fill: "hsl(var(--muted))" }}
                          formatter={(v: number) => [v.toLocaleString(), "Count"]}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
                          {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">No data to display.</div>
                  )}

                  {chartStat.uniqueCount > 8 && (
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Showing top 8 of {chartStat.uniqueCount.toLocaleString()} unique values
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {chartStat && [
                  { label: "Total rows", value: rows.length.toLocaleString() },
                  { label: "Unique values", value: chartStat.uniqueCount.toLocaleString() },
                  { label: "Null / empty", value: chartStat.nullCount.toLocaleString() },
                  { label: "Fill rate", value: `${(((rows.length - chartStat.nullCount) / rows.length) * 100).toFixed(1)}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-card border border-border rounded-xl px-4 py-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
