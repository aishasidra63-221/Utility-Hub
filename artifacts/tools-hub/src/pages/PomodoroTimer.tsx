import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { UsageCount } from "@/components/UsageCount";
import { useSEO } from "@/hooks/useSEO";
import { useToolCounter } from "@/hooks/useToolCounter";

type Mode = "work" | "short" | "long";

const MODES: Record<Mode, { label: string; duration: number; color: string; ring: string; bg: string; icon: React.ReactNode }> = {
  work:  { label: "Focus",        duration: 25 * 60, color: "text-rose-500",    ring: "#f43f5e", bg: "bg-rose-500",    icon: <Brain className="w-4 h-4" /> },
  short: { label: "Short Break",  duration:  5 * 60, color: "text-emerald-500", ring: "#10b981", bg: "bg-emerald-500", icon: <Coffee className="w-4 h-4" /> },
  long:  { label: "Long Break",   duration: 15 * 60, color: "text-sky-500",     ring: "#0ea5e9", bg: "bg-sky-500",     icon: <Coffee className="w-4 h-4" /> },
};

const R = 88;
const CIRC = 2 * Math.PI * R;

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

export default function PomodoroTimer() {
  useSEO({
    title: "Pomodoro Timer — Focus & Productivity Timer | ToolsHub",
    description: "Stay focused with the Pomodoro technique. 25-minute work sessions, short and long breaks — runs entirely in your browser.",
  });

  const { count, increment } = useToolCounter("pomodoro");

  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setRunning(false);
            beep();
            if (mode === "work") {
              setSessions((s) => s + 1);
              increment();
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, increment]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setTimeLeft(MODES[m].duration);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    setTimeLeft(MODES[mode].duration);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const cfg = MODES[mode];
  const total = cfg.duration;
  const progress = timeLeft / total;
  const strokeDashoffset = CIRC * progress;
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const isDone = timeLeft === 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center gap-3">
        <div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
            <Timer className="w-3.5 h-3.5" />
            <span>Productivity</span>
            <UsageCount count={count} label="sessions done" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pomodoro Timer</h1>
          <p className="text-muted-foreground mt-2">
            Focus for 25 minutes, then take a short break. Repeat to stay productive.
          </p>
        </div>
        <ShareButton onCopy={handleShareLink} copied={linkCopied} label="Share this tool" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-6">
        {/* Mode tabs */}
        <div className="flex gap-2 bg-muted/50 rounded-xl p-1 w-full">
          {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === key
                  ? `${cfg.bg} text-white shadow-sm`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cfg.icon}
              <span className="hidden sm:inline">{cfg.label}</span>
              <span className="sm:hidden">{key === "work" ? "Focus" : key === "short" ? "Short" : "Long"}</span>
            </button>
          ))}
        </div>

        {/* Timer ring */}
        <div className="relative flex items-center justify-center">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r={R} fill="none" stroke="currentColor"
              strokeWidth="8" className="text-muted/40" />
            <circle cx="110" cy="110" r={R} fill="none"
              stroke={cfg.ring} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.3s ease" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center gap-1">
            {isDone ? (
              <CheckCircle2 className={`w-8 h-8 ${cfg.color}`} />
            ) : (
              <span className={`text-5xl font-bold tabular-nums tracking-tight ${cfg.color}`}>
                {minutes}:{seconds}
              </span>
            )}
            <span className="text-xs text-muted-foreground font-medium mt-1">{cfg.label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={() => setRunning((r) => !r)}
            disabled={isDone}
            className={`gap-2 px-8 ${isDone ? "opacity-40" : ""}`}
            style={{ backgroundColor: isDone ? undefined : cfg.ring, borderColor: cfg.ring }}
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? "Pause" : isDone ? "Done" : "Start"}
          </Button>
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Session counter */}
        <div className="w-full flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-rose-500" />
            <span>Sessions completed today</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.max(sessions, 4) }).map((_, i) => (
              <div key={i}
                className={`w-3 h-3 rounded-full transition-colors ${i < sessions ? "bg-rose-500" : "bg-muted"}`}
              />
            ))}
            {sessions > 4 && (
              <span className="text-xs text-rose-500 font-bold ml-1">+{sessions - 4}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Work", time: "25 min", color: "text-rose-500" },
          { label: "Short Break", time: "5 min", color: "text-emerald-500" },
          { label: "Long Break", time: "15 min", color: "text-sky-500" },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-xl px-3 py-3">
            <p className={`text-lg font-bold ${item.color}`}>{item.time}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-card border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground">
        💡 <strong>Pomodoro Technique:</strong> Work 25 min → short break → repeat 4 times → long break. Proven to boost focus and reduce mental fatigue.
      </div>
    </div>
  );
}
