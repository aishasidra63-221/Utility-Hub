import { useState, useCallback } from "react";
import {
  ArrowLeftRight, Copy, Check,
  Ruler, Weight, Thermometer, FlaskConical, SquareDashed, Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Category = "length" | "weight" | "temperature" | "volume" | "area" | "speed";

interface Unit {
  label: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const CATEGORIES: { id: Category; label: string; icon: LucideIcon }[] = [
  { id: "length",      label: "Length",      icon: Ruler },
  { id: "weight",      label: "Weight",      icon: Weight },
  { id: "temperature", label: "Temperature", icon: Thermometer },
  { id: "volume",      label: "Volume",      icon: FlaskConical },
  { id: "area",        label: "Area",        icon: SquareDashed },
  { id: "speed",       label: "Speed",       icon: Wind },
];

const UNITS: Record<Category, Unit[]> = {
  length: [
    { label: "Millimeter",  symbol: "mm",   toBase: v => v / 1000,       fromBase: v => v * 1000 },
    { label: "Centimeter",  symbol: "cm",   toBase: v => v / 100,        fromBase: v => v * 100 },
    { label: "Meter",       symbol: "m",    toBase: v => v,              fromBase: v => v },
    { label: "Kilometer",   symbol: "km",   toBase: v => v * 1000,       fromBase: v => v / 1000 },
    { label: "Inch",        symbol: "in",   toBase: v => v * 0.0254,     fromBase: v => v / 0.0254 },
    { label: "Foot",        symbol: "ft",   toBase: v => v * 0.3048,     fromBase: v => v / 0.3048 },
    { label: "Yard",        symbol: "yd",   toBase: v => v * 0.9144,     fromBase: v => v / 0.9144 },
    { label: "Mile",        symbol: "mi",   toBase: v => v * 1609.344,   fromBase: v => v / 1609.344 },
    { label: "Nautical Mile", symbol: "nmi", toBase: v => v * 1852,      fromBase: v => v / 1852 },
  ],
  weight: [
    { label: "Milligram",  symbol: "mg",  toBase: v => v / 1_000_000,  fromBase: v => v * 1_000_000 },
    { label: "Gram",       symbol: "g",   toBase: v => v / 1000,       fromBase: v => v * 1000 },
    { label: "Kilogram",   symbol: "kg",  toBase: v => v,              fromBase: v => v },
    { label: "Tonne",      symbol: "t",   toBase: v => v * 1000,       fromBase: v => v / 1000 },
    { label: "Ounce",      symbol: "oz",  toBase: v => v * 0.0283495,  fromBase: v => v / 0.0283495 },
    { label: "Pound",      symbol: "lb",  toBase: v => v * 0.453592,   fromBase: v => v / 0.453592 },
    { label: "Stone",      symbol: "st",  toBase: v => v * 6.35029,    fromBase: v => v / 6.35029 },
  ],
  temperature: [
    { label: "Celsius",    symbol: "°C",  toBase: v => v,                      fromBase: v => v },
    { label: "Fahrenheit", symbol: "°F",  toBase: v => (v - 32) * 5/9,        fromBase: v => v * 9/5 + 32 },
    { label: "Kelvin",     symbol: "K",   toBase: v => v - 273.15,             fromBase: v => v + 273.15 },
  ],
  volume: [
    { label: "Milliliter", symbol: "mL",  toBase: v => v / 1000,       fromBase: v => v * 1000 },
    { label: "Liter",      symbol: "L",   toBase: v => v,              fromBase: v => v },
    { label: "Cubic Meter",symbol: "m³",  toBase: v => v * 1000,       fromBase: v => v / 1000 },
    { label: "Teaspoon",   symbol: "tsp", toBase: v => v * 0.00492892, fromBase: v => v / 0.00492892 },
    { label: "Tablespoon", symbol: "tbsp",toBase: v => v * 0.0147868,  fromBase: v => v / 0.0147868 },
    { label: "Fluid Ounce",symbol: "fl oz",toBase: v => v * 0.0295735, fromBase: v => v / 0.0295735 },
    { label: "Cup",        symbol: "cup", toBase: v => v * 0.236588,   fromBase: v => v / 0.236588 },
    { label: "Pint",       symbol: "pt",  toBase: v => v * 0.473176,   fromBase: v => v / 0.473176 },
    { label: "Gallon",     symbol: "gal", toBase: v => v * 3.78541,    fromBase: v => v / 3.78541 },
  ],
  area: [
    { label: "Square mm",  symbol: "mm²", toBase: v => v / 1_000_000,  fromBase: v => v * 1_000_000 },
    { label: "Square cm",  symbol: "cm²", toBase: v => v / 10_000,     fromBase: v => v * 10_000 },
    { label: "Square m",   symbol: "m²",  toBase: v => v,              fromBase: v => v },
    { label: "Square km",  symbol: "km²", toBase: v => v * 1_000_000,  fromBase: v => v / 1_000_000 },
    { label: "Square inch",symbol: "in²", toBase: v => v * 0.00064516, fromBase: v => v / 0.00064516 },
    { label: "Square foot",symbol: "ft²", toBase: v => v * 0.092903,   fromBase: v => v / 0.092903 },
    { label: "Acre",       symbol: "ac",  toBase: v => v * 4046.86,    fromBase: v => v / 4046.86 },
    { label: "Hectare",    symbol: "ha",  toBase: v => v * 10_000,     fromBase: v => v / 10_000 },
  ],
  speed: [
    { label: "m/s",        symbol: "m/s",  toBase: v => v,             fromBase: v => v },
    { label: "km/h",       symbol: "km/h", toBase: v => v / 3.6,       fromBase: v => v * 3.6 },
    { label: "mph",        symbol: "mph",  toBase: v => v * 0.44704,   fromBase: v => v / 0.44704 },
    { label: "Knot",       symbol: "kn",   toBase: v => v * 0.514444,  fromBase: v => v / 0.514444 },
    { label: "ft/s",       symbol: "ft/s", toBase: v => v * 0.3048,    fromBase: v => v / 0.3048 },
  ],
};

function convert(value: number, fromUnit: Unit, toUnit: Unit): number {
  const base = fromUnit.toBase(value);
  return toUnit.fromBase(base);
}

function formatResult(n: number): string {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(6);
  }
  const s = parseFloat(n.toPrecision(10)).toString();
  return s;
}

export default function UnitConverter() {
  useSEO({
    title: "Unit Converter — ToolsHub",
    description: "Convert length, weight, temperature, volume, area, and speed units instantly. Free, browser-only unit converter.",
  });

  const { increment } = useToolCounter("unit-converter");

  const [category, setCategory] = useState<Category>("length");
  const [fromIdx, setFromIdx] = useState(2);
  const [toIdx, setToIdx] = useState(3);
  const [input, setInput] = useState("1");
  const [copied, setCopied] = useState(false);

  const units = UNITS[category];
  const fromUnit = units[fromIdx] ?? units[0];
  const toUnit = units[toIdx] ?? units[1];

  const numInput = parseFloat(input);
  const result = !isNaN(numInput) ? convert(numInput, fromUnit, toUnit) : null;
  const resultStr = result !== null ? formatResult(result) : "";

  const handleCategoryChange = useCallback((cat: Category) => {
    setCategory(cat);
    setFromIdx(0);
    setToIdx(1);
    setInput("1");
    increment();
  }, [increment]);

  const handleSwap = () => {
    setFromIdx(toIdx);
    setToIdx(fromIdx);
    if (result !== null) setInput(formatResult(result));
  };

  const handleCopy = () => {
    if (!resultStr) return;
    navigator.clipboard.writeText(`${resultStr} ${toUnit.symbol}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-1">
            Unit Converter
          </h1>
          <p className="text-sm text-muted-foreground">
            Convert between units instantly — 100% in your browser.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <UsageCount toolId="unit-converter" />
          <ShareButton title="Unit Converter" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                category === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Converter Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
        {/* From */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</label>
          <div className="flex gap-3">
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 min-w-0 bg-background border border-border rounded-xl px-4 py-3 text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
              placeholder="Enter value"
            />
            <select
              value={fromIdx}
              onChange={e => setFromIdx(Number(e.target.value))}
              className="bg-background border border-border rounded-xl px-3 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition cursor-pointer"
            >
              {units.map((u, i) => (
                <option key={u.symbol} value={i}>{u.label} ({u.symbol})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="p-2.5 rounded-full bg-muted border border-border hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-150"
            title="Swap units"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</label>
          <div className="flex gap-3">
            <div className="flex-1 min-w-0 bg-muted/50 border border-border rounded-xl px-4 py-3 text-lg font-semibold text-foreground select-all">
              {resultStr || <span className="text-muted-foreground text-sm">—</span>}
            </div>
            <select
              value={toIdx}
              onChange={e => setToIdx(Number(e.target.value))}
              className="bg-background border border-border rounded-xl px-3 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition cursor-pointer"
            >
              {units.map((u, i) => (
                <option key={u.symbol} value={i}>{u.label} ({u.symbol})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result summary + copy */}
        {result !== null && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{input} {fromUnit.symbol}</span>
              {" = "}
              <span className="font-semibold text-primary">{resultStr} {toUnit.symbol}</span>
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="gap-1.5 h-8 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </div>

      {/* Quick reference table */}
      {result !== null && (
        <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              All {CATEGORIES.find(c => c.id === category)?.label} Conversions for {input} {fromUnit.symbol}
            </p>
          </div>
          <div className="divide-y divide-border">
            {units
              .filter((_, i) => i !== fromIdx)
              .map((u) => {
                const val = convert(numInput, fromUnit, u);
                return (
                  <div key={u.symbol} className="flex items-center justify-between px-5 py-2.5 hover:bg-muted/40 transition-colors">
                    <span className="text-sm text-muted-foreground">{u.label}</span>
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {formatResult(val)} <span className="text-muted-foreground font-normal">{u.symbol}</span>
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
