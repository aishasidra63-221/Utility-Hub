import { useState, useMemo } from "react";
import { Calculator, RefreshCw, TrendingDown, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", SGD: "S$",
};

const LOAN_PRESETS = [
  { label: "Home Loan", amount: "5000000", rate: "8.5", tenure: "240" },
  { label: "Car Loan",  amount: "700000",  rate: "9.0", tenure: "60"  },
  { label: "Personal",  amount: "500000",  rate: "12.0", tenure: "36" },
  { label: "Education", amount: "1000000", rate: "10.5", tenure: "84" },
];

function fmt(n: number, symbol: string) {
  if (n >= 10_000_000) return `${symbol}${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `${symbol}${(n / 100_000).toFixed(2)} L`;
  return `${symbol}${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function EmiCalculator() {
  useSEO({
    title: "EMI Calculator — Loan EMI, Interest & Amortization Schedule | ToolsHub",
    description: "Calculate monthly EMI for home, car, or personal loans. See total interest, amortization schedule, and pie chart. Free, private, instant.",
  });

  const { count, increment } = useToolCounter("emi-calculator");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate]           = useState("");
  const [tenure, setTenure]       = useState("");
  const [tenureType, setTenureType] = useState<"months" | "years">("months");
  const [currency, setCurrency]   = useState("INR");
  const [showFull, setShowFull]   = useState(false);

  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  const result = useMemo(() => {
    const P = Number(principal);
    const annualRate = Number(rate);
    const months = tenureType === "years" ? Number(tenure) * 12 : Number(tenure);
    if (!P || !annualRate || !months || P <= 0 || annualRate <= 0 || months <= 0) return null;
    const r = annualRate / 12 / 100;
    const emi = r === 0 ? P / months : (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - P;

    let balance = P;
    const schedule = Array.from({ length: months }, (_, i) => {
      const interest = balance * r;
      const principal_ = emi - interest;
      balance = Math.max(0, balance - principal_);
      const year = Math.floor(i / 12) + 1;
      return { month: i + 1, year, emi, principal: principal_, interest, balance };
    });

    const yearly = schedule.reduce<Record<number, { year: number; principal: number; interest: number; balance: number }>>((acc, row) => {
      if (!acc[row.year]) acc[row.year] = { year: row.year, principal: 0, interest: 0, balance: 0 };
      acc[row.year].principal += row.principal;
      acc[row.year].interest  += row.interest;
      acc[row.year].balance    = row.balance;
      return acc;
    }, {});

    return { emi, totalPayment, totalInterest, schedule, yearly: Object.values(yearly) };
  }, [principal, rate, tenure, tenureType]);

  function handleCalc() { if (result) increment(); }

  function applyPreset(p: typeof LOAN_PRESETS[0]) {
    setPrincipal(p.amount); setRate(p.rate);
    const m = Number(p.tenure);
    if (m % 12 === 0 && m >= 24) { setTenure(String(m / 12)); setTenureType("years"); }
    else { setTenure(p.tenure); setTenureType("months"); }
  }

  const pieData = result ? [
    { name: "Principal", value: Math.round(Number(principal)) },
    { name: "Interest",  value: Math.round(result.totalInterest) },
  ] : [];

  const PIE_COLORS = ["#6366f1", "#f43f5e"];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-5 pb-10">
      <div className="mb-8 flex flex-col items-center text-center gap-3">
        <div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Utility Tools</span>
            <UsageCount count={count} label="calculated" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">EMI Calculator</h1>
          <p className="text-muted-foreground mt-2">Calculate monthly EMI, total interest, and full amortization schedule for any loan. Instant & private.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-5 items-start">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {LOAN_PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-muted/30 hover:bg-muted hover:border-primary/40 transition-all text-foreground">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {Object.entries(CURRENCY_SYMBOLS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Loan Amount ({symbol})</label>
            <input type="number" value={principal} onChange={e => { setPrincipal(e.target.value); }} placeholder="e.g. 500000"
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {principal && Number(principal) > 0 && <p className="text-xs text-muted-foreground">{fmt(Number(principal), symbol)}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Annual Interest Rate (%)</label>
            <input type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} placeholder="e.g. 8.5"
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Loan Tenure</label>
            <div className="flex gap-3">
              <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} placeholder={tenureType === "months" ? "e.g. 60" : "e.g. 5"}
                className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="flex rounded-xl border border-border overflow-hidden">
                {(["months", "years"] as const).map(t => (
                  <button key={t} onClick={() => setTenureType(t)}
                    className={`px-3 py-2 text-sm capitalize transition-all ${tenureType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={handleCalc} className="w-full" disabled={!result}>
            {result ? "EMI Calculated ✓" : "Enter details above"}
          </Button>
        </div>

        {result && (
          <div className="space-y-3 min-w-[200px]">
            {[
              { label: "Monthly EMI", value: fmt(result.emi, symbol), highlight: true, color: "text-primary" },
              { label: "Total Interest", value: fmt(result.totalInterest, symbol), color: "text-red-500" },
              { label: "Total Payment", value: fmt(result.totalPayment, symbol), color: "text-foreground" },
              { label: "Interest %", value: `${((result.totalInterest / Number(principal)) * 100).toFixed(1)}%`, color: "text-amber-500" },
            ].map(({ label, value, highlight, color }) => (
              <div key={label} className={`bg-card border border-border rounded-xl px-4 py-3 ${highlight ? "ring-1 ring-primary/30" : ""}`}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-bold tabular-nums mt-0.5 ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" /> Yearly Balance
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={result.yearly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} label={{ value: "Year", position: "insideBottom", offset: -2, style: { fontSize: 10 } }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={50} tickFormatter={v => `${symbol}${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v: number) => [fmt(v, symbol)]} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Area type="monotone" dataKey="balance" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} name="Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-primary" /> Principal vs Interest
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                  <Tooltip formatter={(v: number) => fmt(v, symbol)} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Amortization Schedule</p>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowFull(f => !f)}>
                {showFull ? "Show yearly" : "Show monthly"}
              </Button>
            </div>
            <div className="overflow-auto max-h-72">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr>
                    {(showFull ? ["Month", "EMI", "Principal", "Interest", "Balance"] : ["Year", "Principal Paid", "Interest Paid", "Balance"]).map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(showFull ? result.schedule : result.yearly).map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      {showFull ? (
                        <>
                          <td className="px-4 py-2 text-xs text-muted-foreground tabular-nums">{(row as typeof result.schedule[0]).month}</td>
                          <td className="px-4 py-2 text-xs tabular-nums">{fmt(result.emi, symbol)}</td>
                          <td className="px-4 py-2 text-xs text-primary tabular-nums">{fmt((row as typeof result.schedule[0]).principal, symbol)}</td>
                          <td className="px-4 py-2 text-xs text-red-500 tabular-nums">{fmt((row as typeof result.schedule[0]).interest, symbol)}</td>
                          <td className="px-4 py-2 text-xs tabular-nums">{fmt((row as typeof result.schedule[0]).balance, symbol)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-xs text-muted-foreground tabular-nums">{(row as typeof result.yearly[0]).year}</td>
                          <td className="px-4 py-2 text-xs text-primary tabular-nums">{fmt((row as typeof result.yearly[0]).principal, symbol)}</td>
                          <td className="px-4 py-2 text-xs text-red-500 tabular-nums">{fmt((row as typeof result.yearly[0]).interest, symbol)}</td>
                          <td className="px-4 py-2 text-xs tabular-nums">{fmt((row as typeof result.yearly[0]).balance, symbol)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
