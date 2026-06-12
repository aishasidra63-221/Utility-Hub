import { Zap } from "lucide-react";

interface SpeedBadgeProps {
  ms: number;
  className?: string;
}

export function SpeedBadge({ ms, className = "" }: SpeedBadgeProps) {
  const display = ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
  const color =
    ms < 500  ? "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20" :
    ms < 2000 ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" :
                "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${color} ${className}`}
      title={`Processed in ${display}`}
    >
      <Zap className="w-3 h-3" />
      {display}
    </span>
  );
}
