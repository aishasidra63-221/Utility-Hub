import { useState, useMemo } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Unit = "metric" | "imperial";

interface BmiResult {
  bmi: number;
  category: string;
  color: string;
  bg: string;
  border: string;
  advice: string;
  pct: number;
}

const CATEGORIES = [
  { label: "Underweight", range: "< 18.5", color: "text-blue-500", bg: "bg-blue-500" },
  { label: "Normal",      range: "18.5–24.9", color: "text-emerald-500", bg: "bg-emerald-500" },
  { label: "Overweight",  range: "25–29.9", color: "text-amber-500", bg: "bg-amber-500" },
  { label: "Obese",       range: "≥ 30", color: "text-red-500", bg: "bg-red-500" },
];

function classify(bmi: number): BmiResult {
  if (bmi < 18.5) return { bmi, category: "Underweight", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", advice: "Consider a balanced diet with higher caloric intake and strength training.", pct: Math.min((bmi / 18.5) * 20, 20) };
  if (bmi < 25)   return { bmi, category: "Normal weight", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", advice: "Great! Maintain your current lifestyle with balanced nutrition and regular exercise.", pct: 20 + ((bmi - 18.5) / 6.4) * 30 };
  if (bmi < 30)   return { bmi, category: "Overweight", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", advice: "Consider increasing physical activity and reducing processed food intake.", pct: 50 + ((bmi - 25) / 5) * 25 };
  return { bmi, category: "Obese", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", advice: "Consult a healthcare provider for a personalised diet and exercise plan.", pct: Math.min(75 + ((bmi - 30) / 10) * 25, 100) };
}

function idealRange(heightCm: number): string {
  const low  = (18.5 * (heightCm / 100) ** 2).toFixed(1);
  const high = (24.9 * (heightCm / 100) ** 2).toFixed(1);
  return `${low} – ${high} kg`;
}

export default function BmiCalculator() {
  useSEO({
    title: "BMI Calculator — Body Mass Index for Metric & Imperial | ToolsHub",
    description: "Calculate your BMI instantly with metric or imperial units. See your category, ideal weight range, and health advice. 100% private, browser-based.",
  });

  const { count, increment } = useToolCounter("bmi-calculator");
  const [unit, setUnit] = useState<Unit>("metric");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight]   = useState("");
  const [age, setAge]         = useState("");
  const [sex, setSex]         = useState<"male" | "female" | "">("");
  const [result, setResult]   = useState<BmiResult | null>(null);

  function calculate() {
    let hM = 0;
    if (unit === "metric") {
      hM = Number(heightCm) / 100;
    } else {
      hM = (Number(heightFt) * 12 + Number(heightIn)) * 0.0254;
    }
    const wKg = unit === "metric" ? Number(weight) : Number(weight) * 0.453592;
    if (!hM || !wKg || hM <= 0 || wKg <= 0) return;
    const bmi = wKg / (hM * hM);
    setResult(classify(bmi));
    increment();
  }

  function reset() {
    setHeightCm(""); setHeightFt(""); setHeightIn(""); setWeight(""); setAge(""); setSex(""); setResult(null);
  }

  const heightCmNum = useMemo(() => {
    if (unit === "metric") return Number(heightCm);
    return (Number(heightFt) * 12 + Number(heightIn)) * 2.54;
  }, [unit, heightCm, heightFt, heightIn]);

  const GaugeBar = () => {
    if (!result) return null;
    const segments = [
      { label: "Underweight", width: 20, bg: "bg-blue-400" },
      { label: "Normal", width: 30, bg: "bg-emerald-400" },
      { label: "Overweight", width: 25, bg: "bg-amber-400" },
      { label: "Obese", width: 25, bg: "bg-red-400" },
    ];
    return (
      <div className="space-y-2">
        <div className="relative h-4 flex rounded-full overflow-hidden">
          {segments.map(s => <div key={s.label} className={`${s.bg} h-full`} style={{ width: `${s.width}%` }} />)}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-5 rounded-sm bg-foreground shadow-lg border-2 border-background transition-all duration-500"
            style={{ left: `calc(${result.pct}% - 6px)` }}
          />
        </div>
        <div className="flex text-[10px] text-muted-foreground font-medium">
          <span style={{ width: "20%" }}>Under</span>
          <span style={{ width: "30%" }}>Normal</span>
          <span style={{ width: "25%" }}>Over</span>
          <span style={{ width: "25%" }}>Obese</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-10">
      <div className="mb-8 flex flex-col items-center text-center gap-3">
        <div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Utility Tools</span>
            <UsageCount count={count} label="calculated" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">BMI Calculator</h1>
          <p className="text-muted-foreground mt-2">Calculate your Body Mass Index with metric or imperial units. Instant, private, no data stored.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex rounded-xl border border-border overflow-hidden w-fit">
          {(["metric", "imperial"] as Unit[]).map(u => (
            <button key={u} onClick={() => { setUnit(u); setResult(null); }}
              className={`px-5 py-2 text-sm font-medium capitalize transition-all
                ${unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              {u}
            </button>
          ))}
        </div>

        {unit === "metric" ? (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Height (cm)</label>
            <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="e.g. 175"
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Height</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} placeholder="5"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ft</span>
              </div>
              <div className="relative flex-1">
                <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="9"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-10" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">in</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === "metric" ? "e.g. 70" : "e.g. 154"}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Age (optional)</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 30"
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sex (optional)</label>
            <select value={sex} onChange={e => setSex(e.target.value as "male" | "female" | "")}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={calculate} className="flex-1">Calculate BMI</Button>
          <Button onClick={reset} variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" />Reset</Button>
        </div>
      </div>

      {result && (
        <div className={`mt-5 bg-card border rounded-2xl p-6 space-y-5 ${result.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Your BMI</p>
              <p className={`text-5xl font-bold tabular-nums ${result.color}`}>{result.bmi.toFixed(1)}</p>
              <p className={`text-lg font-semibold mt-1 ${result.color}`}>{result.category}</p>
            </div>
            <div className={`w-20 h-20 rounded-2xl ${result.bg} flex items-center justify-center`}>
              <Activity className={`w-10 h-10 ${result.color}`} />
            </div>
          </div>

          <GaugeBar />

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Healthy BMI range", value: "18.5 – 24.9" },
              { label: "Healthy weight for your height", value: heightCmNum > 0 ? idealRange(heightCmNum) : "—" },
              ...(age ? [{ label: "Age", value: `${age} years` }] : []),
              ...(sex ? [{ label: "Sex", value: sex.charAt(0).toUpperCase() + sex.slice(1) }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/40 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1.5">Health Advice</p>
            <p className="text-sm text-foreground">{result.advice}</p>
            <p className="text-xs text-muted-foreground mt-2">BMI is a screening tool, not a diagnostic measure. Consult a healthcare provider for personalised advice.</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">BMI Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(c => (
                <div key={c.label} className={`flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 ${result.category.includes(c.label.split(" ")[0]) ? "ring-1 ring-inset ring-primary/40 bg-primary/5" : ""}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${c.bg}`} />
                    <span className="text-xs font-medium text-foreground">{c.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{c.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
